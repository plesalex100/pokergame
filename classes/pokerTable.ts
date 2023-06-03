import Player, { User } from './player';
import Deck from './deck';
import Card from './card';
import Websocket from 'ws';

const seatsOnTable = 6;
class PokerTable {
    
    id: string;
    name: string;
    players: Player[] = [];
    spectators: Websocket[] = [];
    deck: Deck;
    cardsOnTable: Card[] = [];
    stage: number;
    seats: boolean[] = new Array(seatsOnTable).fill(false);

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.deck = new Deck();
        this.stage = 0;
    }

    removeSpectator(socket: Websocket) {
        if (this.spectators.includes(socket)) {
            this.spectators.splice(this.spectators.indexOf(socket), 1);
        }
    }

    addSpectator(socket: Websocket) {
        this.spectators.push(socket);
        socket.on("close", () => {
            this.removeSpectator(socket);
        });

        socket.send(JSON.stringify({
            action: "initTable",
            table: {
                players: this.players.map(player => {
                    return {
                        username: player.username,
                        seatId: player.seatId,
                        coins: player.coins
                    }
                }),
                cardsOnTable: this.cardsOnTable,
                stage: this.stage
            }
        }));
    }

    addPlayer(user: User, seatId: number, socket: Websocket) : {success: boolean, message?: string} {
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

        const newPlayer = new Player(user, seatId, socket, this);

        this.players.push(newPlayer);
        this.broadcast({
            action: "addPlayer",
            player: {
                username: newPlayer.username,
                coins: newPlayer.coins
            },
            seatId: newPlayer.seatId
        }, newPlayer);

        newPlayer.sendData({
            action: "initTable",
            table: {
                players: this.players.map(player => {
                    return {
                        username: player.username,
                        seatId: player.seatId,
                        coins: player.coins
                    }
                }),
                cardsOnTable: this.cardsOnTable,
                stage: this.stage
            }
        });

        newPlayer.socket.on("close", () => {
            this.removePlayer(newPlayer); 
        });

        console.log(`User ${user.username} joined table ${this.name} (${this.id})`);

        return {success: true};
    }

    removePlayer(player: Player) {
        if (!this.players.includes(player)) return;

        this.seats[player.seatId] = false;

        this.players.splice(this.players.indexOf(player), 1);

        this.broadcast({
            action: "removePlayer",
            seatId: player.seatId
        });

        console.log(`User ${player.username} left table ${this.name} (${this.id})`);
    }

    private broadcast(data: any, exceptPlayer?: Player) {
        this.players.forEach(player => {
            if (!exceptPlayer || player !== exceptPlayer) {
                player.sendData(data);
            }
        });

        this.spectators.forEach(socket => {
            socket.send(JSON.stringify(data));
        });
    }

    private dealCards() {
        this.players.forEach(player => {
            player.hand = this.deck.deal(2);

            player.sendData({
                action: "dealCards",
                hand: player.hand
            })
        });

        this.broadcast({ action: "dealPlayerCards" });
    }

    private flop() {
        const flop: Card[] = this.deck.deal(3);
        this.cardsOnTable = flop;
        this.broadcast({
            action: "insertCardsOnTable",
            cards: flop
        });
    }

    private turn() {
        const turn: Card[] = this.deck.deal(1);
        this.cardsOnTable.push(turn[0]);

        this.broadcast({
            action: "insertCardsOnTable",
            cards: turn
        });
    }

    private river() {
        const river: Card[] = this.deck.deal(1);
        this.cardsOnTable.push(river[0]);

        this.broadcast({
            action: "insertCardsOnTable",
            cards: river
        });
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

        this.broadcast({
            action: "reset"
        });
    }

    getTotalPlayers() {
        return this.players.length;
    }
}

export default PokerTable;