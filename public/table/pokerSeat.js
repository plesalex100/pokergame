
const seatContainer = document.querySelector(".seats");
const avilableStates = ["empty", "waiting", "playing", "folded", "allin", "winner"];

class PokerSeat extends Player {

    _state = false;

    constructor (seatId) {
        super();
        this.seatId = seatId;
        this.element = seatContainer.querySelector(`.seat[data-seat-id="${seatId}"]`);
        this.state = "empty";
    }

    set state (newState) {
        if (!avilableStates.includes(newState)) throw new Error("Invalid Seat State");
        this.element.classList.remove(this.state);
        this.element.classList.add(newState);
        this._state = newState;

        if (newState === "empty") {
            const joinBtn = document.createElement("div");
            joinBtn.innerText = "Join";
            joinBtn.classList.add("btn");
            joinBtn.addEventListener("click", () => {
                this.joinTable();
            });

            this.element.innerHTML = "";
            this.element.appendChild(joinBtn);

            if (super.username) {
                super.leaveSeat();
            }
        }
    }

    get state () {
        return this._state;
    }

    joinTable () {
        fetchAPI(`/api/table/${tableId}/join`, {
            method: 'POST',
            body: JSON.stringify({ seatId: this.seatId })
        }).then(({ success, message, user }) => {
            if (!success) {
                notify(message, "error");
                return;
            }
            joined = this.seatId;
            username = user.username;
            notify(message, "success");

            this.state = "waiting";
            this.addUser(user, true);
        });
    }

    addUser (user, isClient = false) {
        
        // user.username is already HTML escaped from register stage
        this.element.innerHTML = `
            <div class="user" style="display: none;">
                <img class="avatar" src="https://robohash.org/${user.username}.png?set=set5" alt="Avatar">
                <span class="name">${user.username}</span>
                <span class="coins"><img src='/global/images/coin.svg'/><span>${user.coins}</span></span>
                <div class="player-cards">
                    <div class="card" data-hidden="true"></div>
                    <div class="card" data-hidden="true"></div>
                </div>
            </div>
        `;

        if (isClient) {
            this.element.querySelector(".user").classList.add("you");
        }

        // afiseaza userul doar dupa ce s-a incarcat imaginea
        const userImage = this.element.querySelector(".avatar");
        userImage.onload = () => {
            this.element.querySelector(".user").removeAttribute("style");
        }

        // testing
        user.hand = [{number: "2", suit: "Romb"}, {number: "J", suit: "Trefla"}];

        const cardsContainer = this.element.querySelector(".player-cards");
        super._constructor(user, isClient, cardsContainer);
    }

    setCards (cards) {
        if (cards.length !== 2) throw new Error("Invalid cards array");
        if (!this.username) return;

        super.setHand(cards);
    }

}