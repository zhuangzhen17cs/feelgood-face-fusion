# backend/app.py
import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify
from flask_socketio import SocketIO
from socket_handlers import register_handlers



app = Flask(__name__)
app.config['SECRET_KEY'] = 'change_me'

# 用 eventlet 异步
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

register_handlers(socketio)

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"message": "Backend is alive"})


@socketio.on("ping")
def handle_ping(data):
    socketio.emit("pong", {"msg": data.get("msg", "")})



if __name__ == "__main__":
    # 用 socketio.run 启动
    socketio.run(app, host="0.0.0.0", port=8000, debug=True)