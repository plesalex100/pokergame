const socket = new WebSocket(`ws://${window.location.host}`);

socket.onopen = () => {
    console.log('Connected to websocket server');

    console.log(token);
}

socket.onmessage = (message) => {
    console.log("WS message", message);
}

socket.onerror = (err) => {
    console.log("WS error", err);
}

socket.onclose = () => {
    notify("Conexiunea la server a fost pierduta ! Reloading page...", "error", 5000);
    setTimeout(() => {
        window.location.reload();
    }, 5000);
}


const sendMessage = (message) => {
    socket.send(message);
}