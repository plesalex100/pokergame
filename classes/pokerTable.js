
const Player = require('./player');
const Deck = require('./deck');

class PokerTable {

    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.players = [];
        this.deck = new Deck();
        this.cardsOnTable = [];
        this.stage = 0;
    }



    addPlayer(user) {
        this.players.push(new Player(user));
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

module.exports = PokerTable;