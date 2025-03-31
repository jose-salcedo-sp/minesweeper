use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LoginResponse {
    success: bool,
    username: String,
    room_id: i16,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LeaderResponse {
    leader: String,
    difference: i16,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct JoinedRoomResponse {
    username: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RegisterResponse {
    success: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct MoveResponse {
    success: bool,
    board: String,
    player: String,
    status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(tag = "type", rename_all = "UPPERCASE")]
pub enum RawTcpMessage {
    Login(LoginResponse),
    Register(RegisterResponse),
    Move(MoveResponse),
    Joined(JoinedRoomResponse),
    LeaderUpdate(LeaderResponse),
}
