import Player, { User } from './player';
import Deck from './deck';
import Card from './card';


class PokerTable {
    
    id: string;
    name: string;
    players: Player[];
    deck: Deck;
    cardsOnTable: Card[];
    stage: number;
    seats: boolean[];

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.players = [];
        this.deck = new Deck();
        this.cardsOnTable = [];
        this.stage = 0;
        this.seats = new Array(6).fill(false);
    }

    addPlayer(user: User, seatId: number) {
        if (this.seats[seatId]) {
            return {success: false, message: "Locul este deja ocupat"};
        }
        this.seats[seatId] = true;

        for(let i = 0; i < this.players.length; i++) {
            if (this.players[i].username === user.username) {
                // TODO: remove user and add him to the new seat
                return {success: false, message: "Esti deja asejat la masa"};
            }
        }

        this.players.push(new Player(user, seatId));

        return {success: true};
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

    getTotalPlayers() {
        return this.players.length;
    }
}

export default PokerTable;