const suits: string[] = ['Inima Rosie', 'Inima Neagra', 'Trefla', 'Romb'];
const numbers: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

interface Card {
    label: string;
    img: string;
    number: number;
    suit: string;
}

class Card {
    constructor(number: string, suit: string) {
        if (!numbers.includes(number)) throw new Error('Invalid Card Number');
        if (!suits.includes(suit)) throw new Error('Invalid Card Suit');

        this.number = numbers.indexOf(number) + 2;
        this.suit = suit;
    }
}

export default Card;
export {
    suits,
    numbers
}