const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
    console.log('Connected to websocket server');
}

socket.onmessage = (message) => {
    console.log("WS message", message);
}

socket.onerror = (err) => {
    console.log("WS error", err);
}

const sendMessage = (message) => {
    socket.send(message);
}