

function shuffleArr<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        
        // swap
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    
    return array;
};

import Card, { suits, numbers } from './card';
    
class Deck {

    cards: Card[];

    constructor() {
        this.cards = [];
        this.reset();
    }

    private shuffle() {
        shuffleArr<Card>(this.cards);
    }

    reset() {
        this.cards = [];
        suits.forEach(suit => {
            numbers.forEach(number => {
                this.cards.push(new Card(number, suit));
            });
        });
        this.shuffle();
    }

    deal(numCards: number) : Card[] {
        return this.cards.splice(0, numCards);
    }
}

export default Deck;