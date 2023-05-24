const suits = ['Inima Rosie', 'Inima Neagra', 'Trefla', 'Romb'];
const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const Card = require('./card');

class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        suits.forEach(suit => {
            numbers.forEach(number => {
                this.cards.push(new Card(number, suit));
            });
        });
    }

    #shuffle() {
        this.cards.shuffle();
    }

    deal(numCards) {
        return this.cards.splice(0, numCards);
    }
}

module.exports = Deck;