
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

let cardsOnTable = [];
for (let cardId = 1; cardId <= 5; cardId++) {
    const cardElement = document.querySelector(`.table-cards .card.on-table[data-card-id="${cardId}"]`);
    const cardObj = new Card(0, false, cardElement, true);

    cardsOnTable.push(cardObj);
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
        
        // pune carti in mana (ascunse) la fiecare jucator care nu e client
        case "dealPlayerCards":
            for(let i = 1; i <= 6; i++) {
                const seat = pokerSeats[i - 1];
                if (seat.state !== "empty" && !seat.isClient) {
                    pokerSeats[i - 1].setCards([{number: 0}, {number: 0}]);
                }
            }
            return;

        case "dealCards":
            if (!joined) return;
            pokerSeats[joined - 1].setCards(data.hand);
            return;

        case "setCardsOnTable":
            data.cards.forEach((card, index) => {
                card.setCard(data.cardsOnTable[index]);
            });
            return;

    }
}

const accessibilityCheckbox = document.getElementById("white-deck");
accessibilityCheckbox.checked = localStorage.getItem("accessibility") === "true";

function setAccessibility() {
    localStorage.setItem("accessibility", accessibilityCheckbox.checked);
    const allCardsImages = document.querySelectorAll(".card > img");
    if (accessibilityCheckbox.checked) {

        allCardsImages.forEach(cardImg => {
            let src = cardImg.src;
            src = src.replace("cards/", "cards_simple/");
            console.log(cardImg, src)
            cardImg.setAttribute("src", src);
        });

        return;
    }

    allCardsImages.forEach(cardImg => {
        let src = cardImg.src;
        src = src.replace("cards_simple/", "cards/");
        cardImg.setAttribute("src", src);
    });
}

// window.onbeforeunload = function() {
//     return "Esti sigur ca vrei sa parasesti jocul de poker ?";
// }