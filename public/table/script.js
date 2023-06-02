
const tableId = window.location.pathname.split("/")[2];
let joined = false;


fetchAPI(`/api/table/${tableId}/join`, {
    method: 'POST',
    body: JSON.stringify({ spectate: true })
}).then(({ success, message }) => {
    if (!success) {
        notify(message, "error");
        return;
    }
});

import PokerSeat from "./pokerSeat";

let pokerSeats = []
for (let seatId = 1; seatId <= 6; seatId++) {
    pokerSeats.push(new PokerSeat(seatId));
}

socket.onmessage = (message) => {
    const { tblId, action, data } = message.data;
    if (tblId !== tableId) return;

    switch (action) {
        case "join":
            const { user, seatId } = data;
            pokerSeats[seatId - 1].addUser(user);
            break;
        case "leave":
            const { seatId: leaveSeatId } = data;
            pokerSeats[leaveSeatId - 1].state = "empty";
            break;
    }
}


console.log("test", tableId);