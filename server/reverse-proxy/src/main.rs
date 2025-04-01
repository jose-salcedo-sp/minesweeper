use clap::Parser;
use futures::{SinkExt, StreamExt};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::{TcpListener, TcpStream, UdpSocket},
    sync::mpsc,
};
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};

mod tcp_messages;
use tcp_messages::RawTcpMessage;

#[derive(Parser, Debug)]
#[command(name = "Reverse Proxy")]
#[command(about = "Minimal WebSocket ↔ TCP/UDP reverse proxy", long_about = None)]
struct Args {
    /// WebSocket proxy listening port
    #[arg(long, default_value_t = 3030)]
    ws_port: u16,
    /// UDP bind port (this proxy binds to this port)
    #[arg(long, default_value_t = 3031)]
    udp_bind_port: u16,
    /// TCP backend port
    #[arg(long, default_value_t = 5000)]
    backend_tcp_port: u16,
    /// Backend UDP port (we will receive from here)
    #[arg(long, default_value_t = 5001)]
    backend_udp_port: u16,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();

    let proxy_ws_addr = format!("0.0.0.0:{}", args.ws_port);
    let backend_tcp_addr = format!("127.0.0.1:{}", args.backend_tcp_port);
    let udp_bind_addr = format!("127.0.0.1:{}", args.udp_bind_port);
    let backend_udp_addr = format!("127.0.0.1:{}", args.udp_bind_port);

    let listener = TcpListener::bind(&proxy_ws_addr).await.unwrap();
    println!("WebSocket proxy listening on ws://{}", proxy_ws_addr);
    println!(
        "Listening for UDP messages on {} (from backend UDP port {})",
        udp_bind_addr, args.backend_udp_port
    );

    while let Ok((stream, _)) = listener.accept().await {
        let backend_tcp_addr = backend_tcp_addr.clone();
        let udp_bind_addr = udp_bind_addr.clone();
        let backend_udp_addr = backend_udp_addr.clone();

        tokio::spawn(handle_ws_client(
            stream,
            backend_tcp_addr,
            udp_bind_addr,
            backend_udp_addr,
        ));
    }
}

async fn handle_ws_client(
    stream: TcpStream,
    backend_tcp_addr: String,
    udp_bind_addr: String,
    backend_udp_addr: String,
) {
    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("WebSocket handshake failed: {}", e);
            return;
        }
    };

    let backend_stream = match TcpStream::connect(&backend_tcp_addr).await {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Failed to connect to TCP backend: {}", e);
            return;
        }
    };

    let (mut backend_reader, mut backend_writer) = tokio::io::split(backend_stream);
    let (mut ws_tx, mut ws_rx) = ws_stream.split();

    let (udp_tx, mut udp_rx) = mpsc::unbounded_channel();

    // Per-client UDP listener task
    tokio::spawn(async move {
        let udp_socket = UdpSocket::bind(&udp_bind_addr).await.unwrap();

        // Connect to backend UDP address so we only receive from that endpoint
        udp_socket.connect(backend_udp_addr).await.unwrap();

        let mut buf = [0u8; 1024];

        loop {
            match udp_socket.recv(&mut buf).await {
                Ok(n) => {
                    let raw = &buf[..n];
                    let raw_str = String::from_utf8_lossy(raw);
                    println!("[UDP → WS] RAW: {}", raw_str);

                    match serde_json::from_slice::<RawTcpMessage>(raw) {
                        Ok(message) => {
                            println!("[UDP → WS] Parsed: {:?}", message);
                            let _ = udp_tx.send(message);
                        }
                        Err(e) => {
                            eprintln!("[UDP → WS] Failed to parse: {:?}", e);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("UDP socket error: {:?}", e);
                    break;
                }
            }
        }
    });

    // WebSocket → TCP backend
    let to_backend = async {
        while let Some(Ok(msg)) = ws_rx.next().await {
            println!("[WS → TCP] RAW: {:?}", msg);

            let data = if msg.is_binary() {
                msg.into_data()
            } else if msg.is_text() {
                msg.into_text().unwrap().into()
            } else {
                continue;
            };

            if backend_writer.write_all(&data).await.is_err() {
                break;
            }
        }
    };

    // TCP + UDP → WebSocket client
    let to_client = async {
        let mut buf = [0u8; 1024];
        loop {
            tokio::select! {
                result = backend_reader.read(&mut buf) => {
                    match result {
                        Ok(0) => break,
                        Ok(n) => {
                            let raw = &buf[..n];
                            let raw_str = String::from_utf8_lossy(raw);
                            println!("[TCP → WS] RAW: {}", raw_str);

                            match serde_json::from_slice::<RawTcpMessage>(raw) {
                                Ok(message) => {
                                    println!("[TCP → WS] Parsed: {:?}", message);
                                    let json = serde_json::to_string(&message).unwrap();
                                    if ws_tx.send(Message::text(json)).await.is_err() {
                                        break;
                                    }
                                }
                                Err(e) => {
                                    eprintln!("[TCP → WS] Failed to parse: {:?}", e);
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("Error reading from TCP: {:?}", e);
                            break;
                        }
                    }
                }

                Some(udp_msg) = udp_rx.recv() => {
                    println!("{:?}", udp_msg);
                    if let Ok(json) = serde_json::to_string(&udp_msg) {
                        if ws_tx.send(Message::text(json)).await.is_err() {
                            break;
                        }
                    }
                }
            }
        }
    };

    tokio::select! {
        _ = to_backend => (),
        _ = to_client => (),
    }
}
