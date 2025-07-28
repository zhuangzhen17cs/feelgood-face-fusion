# backend/socket_handlers.py
from flask_socketio import emit

def register_handlers(socketio):
    @socketio.on("ping")
    def handle_ping(data):
        emit("pong", {"msg": data.get("msg", "")})
