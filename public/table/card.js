const suits = ['Inima Rosie', 'Inima Neagra', 'Trefla', 'Romb'];
const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

class Card {
    element = false;

    constructor(number = 0, suit = false, element = false, hideElement = true) {
        this.element = element;
        if (this.element && hideElement) {
            this.element.dataset.hidden = true;
        }

        this.setCard(number, suit, hideElement);
    }

    hideCard() {
        if (!this.element) return;
        this.element.dataset.hidden = true;
    }

    setElement(element) {
        this.element = element;
    }

    updateElement(hideElement = false) {
        if (!this.element) return;

        this.element.dataset.hidden = hideElement;

        const accessibility = localStorage.getItem("accessibility") === "true";
        
        const cardImage = document.createElement("img");
        cardImage.src = `/global/${accessibility ? 'cards_simple' : 'cards'}/${this.img}.png`;
        cardImage.alt = this.label;
        this.element.innerHTML = "";
        this.element.appendChild(cardImage);
    }

    setCard(number, suit = false, hideElement = false) {
        if (number === 0) {
            this.label = "Carte Ascunsa";
            this.img = "back";
            this.number = 0;
            this.suit = false;

            this.updateElement(hideElement);
            return;
        }

        if (!numbers.includes(number)) throw new Error('Invalid Card Number');
        if (!suits.includes(suit)) throw new Error('Invalid Card Suit');

        this.label = number + ' de ' + suit;
        this.img = `${number}_${suits.indexOf(suit) + 1}`;

        this.number = numbers.indexOf(number) + 2;
        this.suit = suit;

        this.updateElement(hideElement);
    }
}