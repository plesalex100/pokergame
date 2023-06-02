const suits = ['Inima Rosie', 'Inima Neagra', 'Trefla', 'Romb'];
const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

class Card {
    constructor(number, suit) {
        if (!numbers.includes(number)) throw new Error('Invalid Card Number');
        if (!suits.includes(suit)) throw new Error('Invalid Card Suit');

        this.label = number + ' de ' + suit;
        
        this.img = `${number}_${suits.indexOf(suit) + 1}`;
        this.number = numbers.indexOf(number) + 2;
        this.suit = suit;
    }
}

export default Card;