
const seatContainer = document.querySelector(".seats");
const avilableStates = ["empty", "waiting", "playing", "folded", "allin", "winner"];

import Player from '/player.js'

class PokerSeat extends Player {

    _state = false;

    constructor (seatId) {
        this.seatId = seatId;
        this.element = seatContainer.querySelector(`.seat[data-seat-id="${seatId}"]`);
        this.state = "empty";
        super();
    }

    set state (newState) {
        if (!avilableStates.includes(newState)) throw new Error("Invalid Seat State");
        this.element.classList.remove(this.state);
        this.element.classList.add(newState);
        this._state = newState;

        if (newState === "empty") {
            const joinBtn = document.createElement("input");
            joinBtn.value = "Join";
            joinBtn.type = "button";
            joinBtn.classList.add("join-btn");
            joinBtn.addEventListener("click", () => {
                this.joinTable();
            });

            this.element.innerHTML = "";
            this.element.appendChild(joinBtn);
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
            joined = true;
            notify(message, "success");

            this.state = "waiting";
            this.addUser(user, true);
        });
    }

    addUser (user, isClient = false) {
        this.element.innerHTML = `
            <div class="user">
                <img src="https://robohash.org/${user.username}.png?set=set5" alt="Avatar">
                <p>${user.username}</p>
            </div>
        `;

        super._constructor(user, isClient);
    }

}

export default PokerSeat;