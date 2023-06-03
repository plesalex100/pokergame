
const tableId = window.location.pathname.split("/")[2];
let joined = false, username = false;

// Ready, Check, Call
const inputButton1 = document.querySelector(".user-input input[data-input-id='1']");

// Bet / Raise
const inputButton2 = document.querySelector(".user-input input[data-input-id='2']");

// Fold
const inputButton3 = document.querySelector(".user-input input[data-input-id='3']");

// Bet Amount
const inputButton4 = document.querySelector(".user-input input[data-input-id='4']");

function updateRangeValue(input) {
    let rangeValueElement = input.previousElementSibling;
    rangeValueElement.innerText = input.value;
}


let pokerSeats = []
for (let seatId = 1; seatId <= 6; seatId++) {
    pokerSeats.push(new PokerSeat(seatId));
}

socket.onopen = () => {
    fetchAPI(`/api/table/${tableId}/join`, {
        method: 'POST',
        body: JSON.stringify({ spectate: true })
    }).then(({ success, message }) => {
        if (!success) {
            notify(message, "error");
            return;
        }
    });
}

socket.onmessage = (e) => {
    const data = JSON.parse(e.data);

    console.log("recive message", data);

    switch (data.action) {
        case "addPlayer":
            pokerSeats[data.seatId - 1].addUser(data.player);
            return;

        case "removePlayer":
            pokerSeats[data.seatId - 1].state = "empty";
            return;

        case "initTable":
            const tableData = data.table;
            tableData.players.forEach(player => {
                pokerSeats[player.seatId - 1].addUser(player);
            })

            // tableData.stage
            // tableData.cardsOnTable
            return;
    }
}

// window.onbeforeunload = function() {
//     return "Esti sigur ca vrei sa parasesti jocul de poker ?";
// }