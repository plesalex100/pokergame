import Card from "./card";
import { Types as MongooseTypes } from "mongoose";
import User from "../models/user";
import Websocket from "ws";
import PokerTable from "./pokerTable";

interface User {
    username: string;
    coins?: number;
}

class Player {
    username: string;
    coins: number;
    hand: Card[];
    ready: boolean;
    seatId: number;
    socket: Websocket;
    table: PokerTable;

    mongoId: MongooseTypes.ObjectId | undefined;

    constructor(user: User, seatId: number, socket: Websocket, table: PokerTable) {

        console.log(user);
        this.username = user.username;
        this.coins = user.coins || 0;
        this.hand = [];

        this.ready = false;

        User.findOne({username: this.username}, {_id: 1}).then((user) => {
            this.mongoId = user?._id;
        });

        this.seatId = seatId;
        this.socket = socket;
        this.table = table;
    }

    sendData(data: any) {
        this.socket.send(JSON.stringify(data));
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
                return {highlightCards: straightFlush, value: 1000 + this.getHighestCardValue(straightFlush), name: "Chinta Royala"};
            }
            return {highlightCards: flush, value: 600 + this.getHighestCardValue(flush), name: "Culoare"};
        }

        const straight = this.getStraight(hand);
        if (straight.length >= 5) {
            return {highlightCards: straight, value: 500 + this.getHighestCardValue(straight), name: "Chinta"};
        }

        const fourOfAKind = this.getFourOfAKind(hand);
        if (fourOfAKind.length >= 4) {
            return {highlightCards: fourOfAKind, value: 400 + this.getHighestCardValue(fourOfAKind), name: "Careu"};
        }

        const fullHouse = this.getFullHouse(hand);
        if (fullHouse.length >= 5) {
            return {highlightCards: fullHouse, value: 300 + this.getHighestCardValue(fullHouse), name: "Full House"};
        }

        const threeOfAKind = this.getThreeOfAKind(hand);
        if (threeOfAKind.length >= 3) {
            return {highlightCards: threeOfAKind, value: 200 + this.getHighestCardValue(threeOfAKind), name: "Trio"};
        }

        const twoPair = this.getTwoPair(hand);
        if (twoPair.length >= 4) {
            return {highlightCards: twoPair, value: 100 + this.getHighestCardValue(twoPair), name: "Doua perechi"};
        }

        const onePair = this.getOnePair(hand);
        if (onePair.length >= 2) {
            return {highlightCards: onePair, value: 50 + this.getHighestCardValue(onePair), name: "O pereche"};
        }

        const highestCard = this.getHighestCard(hand);
        return {highlightCards: [highestCard], value: highestCard.number, name: "Carte mare"};
    }

    private getHighestCard(hand: Card[]) {
        const sortedHand = hand.sort((a, b) => {
            return b.number - a.number;
        });
        return sortedHand[0];
    }

    private getHighestCardValue(hand: Card[]) {
        return this.getHighestCard(hand).number;
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