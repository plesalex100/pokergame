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
    ready: boolean = false;
    seatId: number;
    socket: Websocket;
    table: PokerTable;
    needAction: boolean = false;
    _betNeeded: number = 0;
    currentBet: number = 0;

    playing: boolean = false;

    mongoId: MongooseTypes.ObjectId | undefined;

    constructor(user: User, seatId: number, socket: Websocket, table: PokerTable) {

        console.log(user);
        this.username = user.username;
        this.coins = user.coins || 0;
        this.hand = [];


        User.findOne({username: this.username}, {_id: 1}).then((user) => {
            this.mongoId = user?._id;
        });

        this.seatId = seatId;
        this.socket = socket;
        this.table = table;
    }

    giveCoins(amount: number) {
        this.coins += amount;
        User.updateOne({username: this.username}, {coins: this.coins});

        this.table.broadcast({
            action: "setPlayerCoins",
            seatId: this.seatId,
            coins: this.coins
        });
    }

    get betNeeded() {
        return Math.max(0, this._betNeeded - this.currentBet);
    }

    set betNeeded(amount: number) {
        this._betNeeded = amount;

        this.sendData({
            action: "setBetNeeded",
            betNeeded: this.betNeeded
        });
    }

    sendData(data: any) {
        this.socket.send(JSON.stringify(data));
    }

    bet(amount: number) : boolean {
        if (this.coins < amount) return false;
        this.coins -= amount;
        this.currentBet += amount;

        User.updateOne({username: this.username}, {coins: this.coins});

        this.table.broadcast({
            action: "setPlayerCoins",
            seatId: this.seatId,
            coins: this.coins
        });

        this.sendData({
            action: "setBetNeeded",
            betNeeded: this.betNeeded
        });

        return true;
    }

    getHandValue(cardsOnTable: Card[]) : number {
        return this.getHandValueAndName(cardsOnTable).value;
    }

    getHandValueAndName(cardsOnTable: Card[]) {
        const hand = this.hand.concat(cardsOnTable);

        console.log(this.username, "getValueHand", hand);
        
        const flush = hand.sort(
            (a, b) => a.suit < b.suit ? -1 : 1
        ).filter(
            card => card.suit === hand[0].suit
        );
        console.log("flush", flush);
        if (flush.length >= 5) {
            const straightFlush = this.getStraight(flush);
            console.log("straightFlush", straightFlush);
            if (straightFlush.length >= 5) {
                return {highlightCards: straightFlush, value: 1000 + this.getHighestCardValue(straightFlush), name: "Chinta Royala"};
            }
            return {highlightCards: flush, value: 600 + this.getHighestCardValue(flush), name: "Culoare"};
        }

        const straight = this.getStraight(hand);
        console.log("straight", straight);
        if (straight.length >= 5) {
            return {highlightCards: straight, value: 500 + this.getHighestCardValue(straight), name: "Chinta"};
        }

        const fourOfAKind = this.getFourOfAKind(hand);
        console.log("fourOfAKind", fourOfAKind);
        if (fourOfAKind.length >= 4) {
            return {highlightCards: fourOfAKind, value: 400 + this.getHighestCardValue(fourOfAKind), name: "Careu"};
        }

        const fullHouse = this.getFullHouse(hand);
        console.log("fullHouse", fullHouse);
        if (fullHouse.length >= 5) {
            return {highlightCards: fullHouse, value: 300 + this.getHighestCardValue(fullHouse), name: "Full House"};
        }

        const threeOfAKind = this.getThreeOfAKind(hand);
        console.log("threeOfAKind", threeOfAKind);
        if (threeOfAKind.length >= 3) {
            return {highlightCards: threeOfAKind, value: 200 + this.getHighestCardValue(threeOfAKind), name: "Trio"};
        }

        const twoPair = this.getTwoPair(hand);
        console.log("twoPair", twoPair);
        if (twoPair.length >= 4) {
            return {highlightCards: twoPair, value: 100 + this.getHighestCardValue(twoPair), name: "Doua perechi"};
        }

        const onePair = this.getOnePair(hand);
        console.log("onePair", onePair);
        if (onePair.length >= 2) {
            return {highlightCards: onePair, value: 50 + this.getHighestCardValue(onePair), name: "O pereche"};
        }

        const highestCard = this.getHighestCard(hand);
        console.log("highestCard", highestCard);
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
        let highestPair: Card[] = [];
        let lastCard: Card = sortedHand[0];
        for (let i = 1; i < sortedHand.length; i++) {
            if (lastCard.number === sortedHand[i].number) {
                twoPair.push(sortedHand[i]);
            } else {
                if (twoPair.length > highestPair.length) {
                    highestPair = twoPair;
                }
                twoPair = [sortedHand[i]];
            }
            lastCard = sortedHand[i];
        }

        if (twoPair.length < highestPair.length) {
            twoPair = highestPair;
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
        let highestPair: Card[] = [];
        let lastCard: Card = sortedHand[0];
        for (let i = 1; i < sortedHand.length; i++) {
            if (lastCard.number === sortedHand[i].number) {
                onePair.push(sortedHand[i]);
            } else {

                if (onePair.length > highestPair.length) {
                    highestPair = onePair;
                }

                onePair = [sortedHand[i]];
            }
            lastCard = sortedHand[i];
        }

        if (onePair.length < highestPair.length) {
            return highestPair;
        }
        return onePair;
    }

    destroy() {
        // TODO: destroy player
    }
}

export default Player;
export { User };