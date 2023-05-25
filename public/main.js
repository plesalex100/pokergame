
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
    console.log('Connected to websocket server');
}

ws.onmessage = (message) => {
    console.log("WS message", message);
}

ws.onerror = (err) => {
    console.log("WS error", err);
}

async function fetch(path, options = {}) {
    const response = await window.fetch(path, options);
    const json = await response.json();
    return json;
}