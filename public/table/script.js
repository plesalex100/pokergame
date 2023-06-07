
const tableId = window.location.pathname.split("/")[2];
let joined = false, username = false;


const postAction = async (action, data = {}) => {
    return await fetchAPI(`/api/table/${tableId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, data })
    });
}

// Ready, Check, Call
const inputButton1 = document.querySelector(".user-input div[data-input-id='1']");
inputButton1.addEventListener("click", () => {
    if (inputButton1.classList.contains("disabled")) return;

    switch (inputButton1.innerText) {
        case "Ready":
        case "Unready":
            
            postAction("ready");

            break;
    }
});

// Bet / Raise
const inputButton2 = document.querySelector(".user-input div[data-input-id='2']");
inputButton2.addEventListener("click", async () => {
    if (inputButton2.classList.contains("disabled")) return;

});

// Fold
const inputButton3 = document.querySelector(".user-input div[data-input-id='3']");
inputButton3.addEventListener("click", async () => {
    if (inputButton3.classList.contains("disabled")) return;

});

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

let currentStage = 0;
// 0 - waiting for players
// 1 - pre-flop
// 2 - flop
// 3 - turn
// 4 - river
// 5 - showdown


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
            currentStage = tableData.stage;
            
            tableData.players.forEach(player => {
                pokerSeats[player.seatId - 1].addUser(player);

                if (currentStage === 0) {
                    if (player.ready) {
                        pokerSeats[player.seatId - 1].message("Ready");
                    }
                }
            });
            
            tableData.cardsOnTable.forEach((card, index) => {
                cardsOnTable[index].setCard(card.number, card.suit);
            });
            return;
        
        // pune carti in mana (ascunse) la fiecare jucator care nu e client
        case "dealPlayerCards":
            for(let i = 1; i <= 6; i++) {
                const seat = pokerSeats[i - 1];
                console.log("seat", i, "state", seat.state, "isClient", seat.isClient);
                if (seat.state !== "empty" && !seat.isClient) {
                    console.log("setting cards for seat", i, "to", "[{number: 0}, {number: 0}]")
                    pokerSeats[i - 1].setCards([{number: 0}, {number: 0}]);
                }
            }

            currentStage = 1;
            return;

        case "dealCards":
            if (!joined) return;
            pokerSeats[joined - 1].setCards(data.hand);
            return;

        case "setCardsOnTable":
            data.cards.forEach((card, index) => {
                cardsOnTable[index].setCard(card.number, card.suit);
            });
            return;

        case "resetCardsOnTable":
            cardsOnTable.forEach(card => {
                card.reset();
            });
            return;

        case "togglePlayerReady":
            const { seatId, ready } = data;

            if (seatId === joined) {
                inputButton1.innerText = ready ? "Unready" : "Ready";
            }

            pokerSeats[seatId - 1].message(ready ? "Ready" : false);

            return;

        case "winner":
            notify(`Castigatorul este ${data.winner.username} cu ${data.winner.winningHand.name} !`, "success");
            return;

        case "reset":
            pokerSeats.forEach(seat => {
                seat.resetCards();
            });
            cardsOnTable.forEach(card => {
                card.reset();
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