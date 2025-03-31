use futures::{SinkExt, StreamExt};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::{TcpListener, TcpStream},
};
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:3030").await.unwrap();
    println!("Listening on ws://127.0.0.1:3030");

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_ws_client(stream));
    }
}

async fn handle_ws_client(stream: tokio::net::TcpStream) {
    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("WebSocket handshake failed: {}", e);
            return;
        }
    };

    // Connect to raw TCP backend
    let backend_stream = match TcpStream::connect("127.0.0.1:5000").await {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Failed to connect to backend: {}", e);
            return;
        }
    };
    let (mut backend_reader, mut backend_writer) = tokio::io::split(backend_stream);
    let (mut ws_tx, mut ws_rx) = ws_stream.split();

    // From WebSocket → Backend TCP
    let to_backend = async {
        while let Some(Ok(msg)) = ws_rx.next().await {
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

    // From Backend TCP → WebSocket
    let to_client = async {
        let mut buf = [0u8; 1024];
        loop {
            match backend_reader.read(&mut buf).await {
                Ok(0) => break,
                Ok(n) => {
                    let msg = Message::binary(buf[..n].to_vec());
                    if ws_tx.send(msg).await.is_err() {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
    };

    tokio::select! {
        _ = to_backend => (),
        _ = to_client => (),
    }
}
