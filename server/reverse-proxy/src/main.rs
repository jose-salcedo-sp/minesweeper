use futures::{SinkExt, StreamExt};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::{TcpListener, TcpStream, UdpSocket},
    sync::mpsc,
};
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};

mod tcp_messages;
use tcp_messages::RawTcpMessage;

const PROXY_WS_ADDR: &str = "0.0.0.0:3030"; // WebSocket proxy server
const BACKEND_TCP_ADDR: &str = "127.0.0.1:5000"; // TCP backend
const PROXY_UDP_BIND_ADDR: &str = "127.0.0.1:5001"; // We listen for UDP messages here

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind(PROXY_WS_ADDR).await.unwrap();
    println!("WebSocket proxy listening on ws://{PROXY_WS_ADDR}");

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_ws_client(stream));
    }
}

async fn handle_ws_client(stream: TcpStream) {
    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("WebSocket handshake failed: {}", e);
            return;
        }
    };

    // Connect to raw TCP backend
    let backend_stream = match TcpStream::connect(BACKEND_TCP_ADDR).await {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Failed to connect to TCP backend: {}", e);
            return;
        }
    };

    let (mut backend_reader, mut backend_writer) = tokio::io::split(backend_stream);
    let (mut ws_tx, mut ws_rx) = ws_stream.split();

    let (udp_tx, mut udp_rx) = mpsc::unbounded_channel();

    // Spawn UDP listener task
    tokio::spawn(async move {
        let udp_socket = UdpSocket::bind(PROXY_UDP_BIND_ADDR).await.unwrap();
        let mut buf = [0u8; 1024];

        loop {
            match udp_socket.recv_from(&mut buf).await {
                Ok((n, _addr)) => {
                    let raw = &buf[..n];
                    match serde_json::from_slice::<RawTcpMessage>(raw) {
                        Ok(message) => {
                            let _ = udp_tx.send(message);
                        }
                        Err(e) => eprintln!("Failed to parse UDP message: {:?}", e),
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
            println!("Received from WS: {:?}", msg);

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
                // TCP input
                result = backend_reader.read(&mut buf) => {
                    match result {
                        Ok(0) => break,
                        Ok(n) => {
                            let raw = &buf[..n];
                            if let Ok(message) = serde_json::from_slice::<RawTcpMessage>(raw) {
                                let json = serde_json::to_string(&message).unwrap();
                                if ws_tx.send(Message::text(json)).await.is_err() {
                                    break;
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("Error reading from TCP: {:?}", e);
                            break;
                        }
                    }
                }

                // UDP messages via channel
                Some(udp_msg) = udp_rx.recv() => {
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
