import Card from "./card";

interface User {
    username: string;
    coins?: number;
}

class Player {
    username: string;
    coins: number;
    hand: Card[];

    constructor(user: User) {
        this.username = user.username;
        this.coins = user.coins || 0;
        this.hand = [];
    }

    bet(amount: number) : number {
        this.coins -= amount;
        return amount;
    }

    getHandValue(cardsOnTable: Card[]) : number {
        return this.getHandValueAndName(cardsOnTable).value;
    }

    getHandValueAndName(cardsOnTable: Card[]) {
        const hand = this.hand.concat(cardsOnTable);
        
        const flush = hand.filter(card => card.suit === hand[0].suit);
        if (flush.length >= 5) {
            const straightFlush = this.getStraight(flush);
            if (straightFlush.length >= 5) {
                return {value: 1000 + this.getHighestCardValue(straightFlush), name: "Chinta Royala"};
            }
            return {value: 600 + this.getHighestCardValue(flush), name: "Culoare"};
        }

        const straight = this.getStraight(hand);
        if (straight.length >= 5) {
            return {value: 500 + this.getHighestCardValue(straight), name: "Chinta"};
        }

        const fourOfAKind = this.getFourOfAKind(hand);
        if (fourOfAKind.length >= 4) {
            return {value: 400 + this.getHighestCardValue(fourOfAKind), name: "Careu"};
        }

        const fullHouse = this.getFullHouse(hand);
        if (fullHouse.length >= 5) {
            return {value: 300 + this.getHighestCardValue(fullHouse), name: "Full House"};
        }

        const threeOfAKind = this.getThreeOfAKind(hand);
        if (threeOfAKind.length >= 3) {
            return {value: 200 + this.getHighestCardValue(threeOfAKind), name: "Trio"};
        }

        const twoPair = this.getTwoPair(hand);
        if (twoPair.length >= 4) {
            return {value: 100 + this.getHighestCardValue(twoPair), name: "Doua perechi"};
        }

        const onePair = this.getOnePair(hand);
        if (onePair.length >= 2) {
            return {value: 50 + this.getHighestCardValue(onePair), name: "O pereche"};
        }

        return {value: this.getHighestCardValue(hand), name: "Carte mare"};
    }

    private getHighestCardValue(hand: Card[]) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        return sortedHand[0].number;
    }

    private getStraight(hand: Card[]) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let straight: Card[] = [];
        let lastCard: Card = sortedHand[0];
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

    private getFourOfAKind(hand: Card[]) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let fourOfAKind: Card[] = [];
        let lastCard: Card = sortedHand[0];
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

    private getFullHouse(hand: Card[]) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let threeOfAKind: Card[] = [];
        let lastCard: Card = sortedHand[0];
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

    private getThreeOfAKind(hand: Card[]) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let threeOfAKind: Card[] = [];
        let lastCard: Card = sortedHand[0];
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

    private getTwoPair(hand: Card[]) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let twoPair: Card[] = [];
        let lastCard: Card = sortedHand[0];
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

    private getOnePair(hand: Card[]) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        let onePair: Card[] = [];
        let lastCard: Card = sortedHand[0];
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

    destroy() {
        // TODO: destroy player
    }
}

export default Player;
export { User };