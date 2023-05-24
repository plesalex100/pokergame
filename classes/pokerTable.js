class Player {
    consturctor(user) {
        this.username = user.username;
        this.coins = user.coins;
        this.hand = [];
    }

    bet(amount) {
        this.coins -= amount;
        return amount;
    }

    getHandValue(cardsOnTable) {
        const hand = this.hand.concat(cardsOnTable);
        
        const flush = hand.filter(card => card.suit === hand[0].suit);
        if (flush.length >= 5) {
            const straightFlush = this.getStraight(flush);
            if (straightFlush.length >= 5) {
                return 1000 + this.getHighestCardValue(straightFlush);
            }
            return 600 + this.getHighestCardValue(flush);
        }

        const straight = this.getStraight(hand);
        if (straight.length >= 5) {
            return 500 + this.getHighestCardValue(straight);
        }

        const fourOfAKind = this.getFourOfAKind(hand);
        if (fourOfAKind.length >= 4) {
            return 400 + this.getHighestCardValue(fourOfAKind);
        }

        const fullHouse = this.getFullHouse(hand);
        if (fullHouse.length >= 5) {
            return 300 + this.getHighestCardValue(fullHouse);
        }

        const threeOfAKind = this.getThreeOfAKind(hand);
        if (threeOfAKind.length >= 3) {
            return 200 + this.getHighestCardValue(threeOfAKind);
        }

        const twoPair = this.getTwoPair(hand);
        if (twoPair.length >= 4) {
            return 100 + this.getHighestCardValue(twoPair);
        }

        const onePair = this.getOnePair(hand);
        if (onePair.length >= 2) {
            return 50 + this.getHighestCardValue(onePair);
        }

        return this.getHighestCardValue(hand);
    }

    getHighestCardValue(hand) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        return sortedHand[0].number;
    }

    getStraight(hand) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let straight = [];
        let lastCard = sortedHand[0];
        for (let i = 1; i < sortedHand.length; i++) {
            if (lastCard.number - sortedHand[i].number === 1) {
                straight.push(sortedHand[i]);
            } else {
                straight = [sortedHand[i]];
            }
            lastCard = sortedHand[i];
        }
        return straight;
    }

    getFourOfAKind(hand) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let fourOfAKind = [];
        let lastCard = sortedHand[0];
        for (let i = 1; i < sortedHand.length; i++) {
            if (lastCard.number === sortedHand[i].number) {
                fourOfAKind.push(sortedHand[i]);
            } else {
                fourOfAKind = [sortedHand[i]];
            }
            lastCard = sortedHand[i];
        }
        return fourOfAKind;
    }

    getFullHouse(hand) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let threeOfAKind = [];
        let lastCard = sortedHand[0];
        for (let i = 1; i < sortedHand.length; i++) {
            if (lastCard.number === sortedHand[i].number) {
                threeOfAKind.push(sortedHand[i]);
            } else {
                threeOfAKind = [sortedHand[i]];
            }
            lastCard = sortedHand[i];
        }
        if (threeOfAKind.length < 3) {
            return [];
        }
        const fullHouse = threeOfAKind.concat(this.getOnePair(sortedHand.filter(card => {
            return card.number !== threeOfAKind[0].number;
        })));
        return fullHouse;
    }

    getThreeOfAKind(hand) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let threeOfAKind = [];
        let lastCard = sortedHand[0];
        for (let i = 1; i < sortedHand.length; i++) {
            if (lastCard.number === sortedHand[i].number) {
                threeOfAKind.push(sortedHand[i]);
            } else {
                threeOfAKind = [sortedHand[i]];
            }
            lastCard = sortedHand[i];
        }
        return threeOfAKind;
    }

    getTwoPair(hand) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let twoPair = [];
        let lastCard = sortedHand[0];
        for (let i = 1; i < sortedHand.length; i++) {
            if (lastCard.number === sortedHand[i].number) {
                twoPair.push(sortedHand[i]);
            } else {
                twoPair = [sortedHand[i]];
            }
            lastCard = sortedHand[i];
        }
        if (twoPair.length < 2) {
            return [];
        }
        return twoPair.concat(this.getOnePair(sortedHand.filter(card => {
            return card.number !== twoPair[0].number;
        })));
    }

    getOnePair(hand) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let onePair = [];
        let lastCard = sortedHand[0];
        for (let i = 1; i < sortedHand.length; i++) {
            if (lastCard.number === sortedHand[i].number) {
                onePair.push(sortedHand[i]);
            } else {
                onePair = [sortedHand[i]];
            }
            lastCard = sortedHand[i];
        }
        return onePair;
    }
}

class Card {
    constructor(number, suit) {
        this.label = number + ' de ' + suit;
        
        const suits = ['Inima Rosie', 'Inima Neagra', 'Trefla', 'Romb'];
        const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10',
        'J', 'Q', 'K', 'A'];
        
        this.img = `${number}_${suits.indexOf(suit) + 1}`;
        this.number = numbers.indexOf(number) + 2;
        this.suit = suit;
    }
}

class Deck {

    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        const suits = ['Inima Rosie', 'Inima Neagra', 'Trefla', 'Romb'];
        const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10',
                         'J', 'Q', 'K', 'A'];
        suits.forEach(suit => {
            numbers.forEach(number => {
                this.cards.push(new Card(number, suit));
            });
        });
    }

    deal(numCards) {
        return this.cards.splice(0, numCards);
    }
}

class PokerTable {

    constructor(id) {
        this.id = id;
        this.players = [];
        this.deck = new Deck();
        this.cardsOnTable = [];
    }

    addPlayer(player) {
        this.players.push(player);
    }

    dealCards() {
        this.players.forEach(player => {
            player.hand = this.deck.deal(2);
        });
    }

    flop() {
        this.cardsOnTable = this.deck.deal(3);
    }

    turn() {
        this.cardsOnTable.push(this.deck.deal(1)[0]);
    }

    river() {
        this.cardsOnTable.push(this.deck.deal(1)[0]);
    }

    getWinner() {
        let winner = this.players[0];
        this.players.forEach(player => {
            if (player.getHandValue(this.cardsOnTable) > winner.getHandValue(this.cardsOnTable)) {
                winner = player;
            }
        });
        return winner;
    }

    reset() {
        this.players.forEach(player => {
            player.hand = [];
        });
        this.deck.reset();
        this.cardsOnTable = [];
    }

}