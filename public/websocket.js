const socket = new WebSocket(`ws://${window.location.host}`);

socket.onerror = (err) => {
    console.log("WS error", err);
}

socket.onclose = () => {
    notify("Conexiunea la server a fost pierduta ! Reloading page...", "error", 5000);
    setTimeout(() => {
        window.location.reload();
    }, 5000);
}