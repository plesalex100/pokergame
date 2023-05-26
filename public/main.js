
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

async function fetchAPI(path, options = {}) {
    const response = await fetch(path, options);
    const json = await response.json();
    return json;
}

const isHidden = elem => {
    const styles = window.getComputedStyle(elem)
    return styles.display === 'none' || styles.visibility === 'hidden'
}

// Notification
const body = document.querySelector("body");


let notificationCount = 0;
const notify = (message, type = "info", hideMsec = 3000) => {

    const notificationContainer = document.createElement("div");
    notificationContainer.classList.add("notification-container");
    notificationContainer.innerHTML = `<p></p>`;
    body.prepend(notificationContainer);

    notificationContainer.classList.add(type);
    notificationContainer.querySelector("p").innerText = message;
    
    notificationContainer.style.top = `${notificationCount * 60}px`;
    notificationCount++;
    
    setTimeout(() => {
        notificationContainer.classList.add("hideanim");
        setTimeout(() => {
            notificationContainer.remove();
            notificationCount--;
        }, 500);
    }, hideMsec);
}

