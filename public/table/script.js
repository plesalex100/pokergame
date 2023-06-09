
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

    switch (inputButton1.dataset.action) {
        case "ready": // unready too
            postAction("ready");
            break;

        case "check":
            postAction("check");
            break;

        case "call":
            postAction("call");
            break;
    }
});

// Bet / Raise
const inputButton2 = document.querySelector(".user-input div[data-input-id='2']");
inputButton2.addEventListener("click", async () => {
    if (inputButton2.classList.contains("disabled")) return;

    const betAmount = inputButton4.value;
    postAction("bet", { amount: parseInt(betAmount) });
});

// Fold
const inputButton3 = document.querySelector(".user-input div[data-input-id='3']");
inputButton3.addEventListener("click", async () => {
    if (inputButton3.classList.contains("disabled")) return;

    postAction("fold");
});

// Bet Amount
const inputButton4 = document.querySelector(".user-input input[data-input-id='4']");

function updateRangeValue(input) {
    let rangeValueElement = input.previousElementSibling;
    rangeValueElement.innerText = input.value;
}

const seatsAtTable = 6;
let pokerSeats = []
for (let seatId = 1; seatId <= seatsAtTable; seatId++) {
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

const setPot = (pot) => {
    if (pot == 0) {
        document.querySelector(".table-pot").style.display = "none";
        return;
    }
    document.querySelector(".table-pot").style.display = "flex";
    
    document.querySelector(".table-pot > span").innerText = pot;
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

        case "sendMessage":
            pokerSeats[data.seatId - 1].message(data.message, data.hideMsec || undefined);
            return;

        case "setPlayerCoins":
            pokerSeats[data.seatId - 1].setCoins(data.coins);

            if (joined && data.seatId === joined) {
                inputButton4.attributes.max.value = data.coins;
            }
            return;

        case "setPot":
            setPot(data.pot);
            return;
        
        case "setTimer":
            const { msec, title } = data;
            notify(title, "info", msec);
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

            setPot(tableData.pot);

            cardsOnTable.forEach(card => card.reset());
            tableData.cardsOnTable.forEach((card, index) => {
                cardsOnTable[index].setCard(card.number, card.suit);
            });
            return;
        
        // pune carti in mana (ascunse) la fiecare jucator care nu e client
        case "dealPlayerCards":
            for(let i = 1; i <= seatsAtTable; i++) {
                if (i === joined) continue;
                const seat = pokerSeats[i - 1];
                if (seat.state !== "empty" && !seat.isClient) {
                    pokerSeats[i - 1].setCards([{number: 0}, {number: 0}]);
                    pokerSeats[i - 1].state = "playing";
                }
            }

            currentStage = 1;
            return;

        case "dealCards":
            if (!joined) return;
            pokerSeats[data.seatId || joined - 1].setCards(data.hand);
            pokerSeats[data.seatId || joined - 1].state = "playing";
            return;

        case "setBetNeeded":
            const { betNeeded } = data;

            if (betNeeded === 0) {
                inputButton1.innerText = "Check";
                inputButton1.dataset.action = "check";
                inputButton2.innerText = "Bet";

                inputButton4.attributes.min.value = 20;
                inputButton4.value = 20;
                updateRangeValue(inputButton4);
                return;
            }

            inputButton1.innerText = "Call " + betNeeded;
            inputButton1.dataset.action = "call";
            inputButton2.innerText = "Raise";
            inputButton4.attributes.min.value = betNeeded * 2;
            inputButton4.value = betNeeded * 2;
            updateRangeValue(inputButton4);

            return;

        case "setPlayerTurn":
            pokerSeats.forEach(seat => {
                if (seat.state !== "turn") return;
                seat.state = "playing";
            });

            if (data.seatId === joined) {
                inputButton1.classList.remove("disabled");
                inputButton2.classList.remove("disabled");
                inputButton3.classList.remove("disabled");
            } else {
                inputButton1.classList.add("disabled");
                inputButton2.classList.add("disabled");
                inputButton3.classList.add("disabled");
            }

            pokerSeats[data.seatId - 1].state = "turn";
            return;

        case "setPlayerFold":
            pokerSeats[data.seatId - 1].state = "folded";
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
            pokerSeats[data.winner.seatId - 1].state = "winner";
            setTimeout(() => {
                pokerSeats[data.winner.seatId - 1].state = "playing";
            }, 3000);
            return;

        case "reset":
            pokerSeats.forEach(seat => {
                seat.resetCards();
                seat.message(false);
            });
            cardsOnTable.forEach(card => {
                card.reset();
            });
            setPot(0);
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