import Player, { User } from './player';
import Deck from './deck';
import Card from './card';
import Websocket from 'ws';

// stages:
// 0 - waiting for players
// 1 - pre-flop
// 2 - flop
// 3 - turn
// 4 - river
// 5 - showdown

interface GameData {
    pot: number;
    smallBlind: number;
    bigBlind: number;
    turnSeat: number;
}
const defaultGameData: GameData = {
    pot: 0,
    smallBlind: -1,
    bigBlind: -1,
    turnSeat: 0
}

const smallBlindPrice = 10;

const seatsOnTable = 6;
class PokerTable {

    id: string;
    name: string;
    players: Player[] = [];
    spectators: Websocket[] = [];
    deck: Deck;
    cardsOnTable: Card[] = [];
    stage: number;
    timer: ReturnType<typeof setTimeout> | null = null;

    seats: boolean[] | Player[] = new Array(seatsOnTable).fill(false);

    gameData: GameData = defaultGameData;

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
            table: this.getInitTableData()
        }));
    }

    private getPlayerOnSeat(seatId: number) {
        return this.seats[seatId - 1] as Player;
    }

    private getInitTableData() {
        return {
            players: this.players.map(player => {
                return {
                    username: player.username,
                    seatId: player.seatId,
                    coins: player.coins,
                    ready: player.ready || false
                }
            }),
            pot: this.gameData.pot,
            cardsOnTable: this.cardsOnTable,
            stage: this.stage
        }
    }

    addPlayer(user: User, seatId: number, socket: Websocket): { success: boolean, message?: string } {
        if (this.seats[seatId - 1] !== false) {
            return { success: false, message: "Locul este deja ocupat" };
        }

        this.removeSpectator(socket);

        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].username === user.username) {
                // TODO: remove user and add him to the new seat
                // return {success: false, message: "Esti deja asejat la masa"};

                this.removePlayer(this.players[i]);
                break;
            }
        }

        const newPlayer = new Player(user, seatId, socket, this);
        this.seats[seatId - 1] = newPlayer;

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
            table: this.getInitTableData()
        });

        newPlayer.socket.on("close", () => {
            this.removePlayer(newPlayer);
        });

        console.log(`User ${user.username} joined table ${this.name} (${this.id}) on seat ${seatId}`);

        return { success: true };
    }

    removePlayer(player: Player) {
        if (!this.players.includes(player)) return;

        this.broadcast({
            action: "removePlayer",
            seatId: player.seatId
        });

        this.seats[player.seatId - 1] = false;
        this.players.splice(this.players.indexOf(player), 1);

        console.log(`User ${player.username} left table ${this.name} (${this.id})`);

        if (this.players.length < 2) {
            this.reset();
        }
    }

    get pot () {
        return this.gameData.pot;
    }

    set pot (value: number) {
        this.gameData.pot = value;
        this.broadcast({
            action: "setPot",
            pot: this.gameData.pot
        });
    }

    broadcast(data: any, exceptPlayer?: Player) {
        this.players.forEach(player => {
            if (!exceptPlayer || player.mongoId !== exceptPlayer.mongoId) {
                player.sendData(data);
            }
        });

        this.spectators.forEach(socket => {
            socket.send(JSON.stringify(data));
        });
    }

    private tryToStartGame() {
        if (this.players.length < 2) return;
        
        const totalReady = this.players.reduce((readyPlayers, player) => readyPlayers + (player.ready ? 1 : 0), 0);

        if (totalReady === this.players.length) {
            this.setTimer(() => {
                this.setGameStage(1);
            }, 3000, "Jocul incepe");
        } else {
            this.clearTimer();
        }
    }

    private clearTimer() {
        this.setTimer(() => { }, 0, "", true);
    }

    private setTimer(callback: () => void, msec: number, title: string = "", overwrite: boolean = false) {
        if (this.timer) {
            if (!overwrite) return;
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (msec === 0) return; // clear timer only

        this.timer = setTimeout(() => {
            callback();
            this.timer = null;
        }, msec);

        if (title.length > 0) {
            this.broadcast({
                action: "setTimer",
                msec,
                title
            });
        }
    }

    private pickNextRoundSeatId(currentSeatId: number = this.gameData.turnSeat) : number | boolean {

        if (this.players.length < 2) return false;
        if (this.players.reduce((total, player) => total + (player.needAction ? 1 : 0), 0) === 0) return false;

        while (true) {
            currentSeatId = (currentSeatId % seatsOnTable) + 1;
            const player = this.getPlayerOnSeat(currentSeatId);

            if (player && player.playing && player.needAction) {
                return currentSeatId;
            }
        }
    }

    private setGameStage(stage: number) {
        if (this.stage === stage) return;

        this.stage = stage;

        switch (stage) {
            case 0: // waiting for players
                this.reset();
                this.tryToStartGame();
                break;

            case 1: // pre-flop

                console.log("Pre-flop");

                const lastSmallBlind = this.gameData.smallBlind;
                const lastBigBlind = this.gameData.bigBlind;

                if (lastSmallBlind === lastBigBlind) {
                    // first time when game starts

                    for(let seatIndex = 0; seatIndex < seatsOnTable; seatIndex++) {
                        if (this.seats[seatIndex] === false) continue;
    
                        const player = this.seats[seatIndex] as Player;
                        player.playing = true;

                        const seatId = seatIndex + 1;

                        if (this.gameData.smallBlind == lastSmallBlind) {
                            this.gameData.smallBlind = seatId;
                            continue;
                        }
                        this.gameData.bigBlind = seatId;
                        break;
                    }

                } else {

                    for (let seatIndex = 0; seatIndex < seatsOnTable; seatIndex++) {
                        if (this.seats[seatIndex] === false) continue;
                        const player = this.seats[seatIndex] as Player;
                        player.playing = true;
                    }

                    let lastValidBigBlind = -1;
                    while (this.gameData.smallBlind === lastSmallBlind) {
                        this.gameData.bigBlind = (this.gameData.bigBlind % seatsOnTable) + 1;
                        if (this.seats[this.gameData.bigBlind - 1] === false) continue;

                        if (lastValidBigBlind === -1) {
                            lastValidBigBlind = this.gameData.bigBlind;
                            continue;
                        }

                        this.gameData.smallBlind = lastValidBigBlind;
                        break;
                    }
                }

                const smallBlindPlayer = this.getPlayerOnSeat(this.gameData.smallBlind);
                const bigBlindPlayer = this.getPlayerOnSeat(this.gameData.bigBlind);

                console.log("smallBlindPlayer", smallBlindPlayer.username);
                console.log("bigBlindPlayer", bigBlindPlayer.username);
                
                for (let i = 0; i < this.players.length; i++) {
                    const player = this.players[i];
                    if (!player.playing) continue;

                    player.needAction = true;
                    player.betNeeded = smallBlindPrice * 2;
                }
                
                if (smallBlindPlayer.bet(smallBlindPrice) && bigBlindPlayer.bet(smallBlindPrice * 2)) {
                    this.pot = smallBlindPrice * 3;
                }

                this.sendMessage(smallBlindPlayer, `Small Blind ${smallBlindPrice} coins`, 4000);
                this.sendMessage(bigBlindPlayer, `Big Blind ${smallBlindPrice * 2} coins`, 4000);

                this.dealCards();

                const nextPlayer = this.pickNextRoundSeatId(this.gameData.bigBlind);

                if (nextPlayer === false) {
                    throw new Error("No player found as next round player, this should not happen");
                }
                this.gameData.turnSeat = nextPlayer as number;
                this.broadcast({
                    action: "setPlayerTurn",
                    seatId: this.gameData.turnSeat
                });
    
                break;

            case 2: // flop

                console.log("Flop");

                this.players.forEach(player => {
                    if (!player.playing) return;
                    player.needAction = true;
                });

                this.gameData.turnSeat = this.pickNextRoundSeatId() as number;
                this.broadcast({
                    action: "setPlayerTurn",
                    seatId: this.gameData.turnSeat
                });
                this.flop();

                break;

            case 3: // turn
                
                console.log("Turn");
                this.players.forEach(player => {
                    if (!player.playing) return;
                    player.needAction = true;
                });

                this.gameData.turnSeat = this.pickNextRoundSeatId() as number;
                this.broadcast({
                    action: "setPlayerTurn",
                    seatId: this.gameData.turnSeat
                });
                this.turn();

                break;

            case 4: // river

                console.log("River");
                this.players.forEach(player => {
                    if (!player.playing) return;
                    player.needAction = true;
                });

                this.gameData.turnSeat = this.pickNextRoundSeatId() as number;
                this.broadcast({
                    action: "setPlayerTurn",
                    seatId: this.gameData.turnSeat
                });
                this.river();

                break;

            case 5: // showdown

                console.log("Get Winner");

                this.getWinner();

                setTimeout(() => {
                    this.setTimer(() => {
                        this.setGameStage(1);
                    }, 3000, "Jocul se reseteaza in 3 secunde");
                }, 4000);

                break;

        }

    }

    private sendMessage(player: Player, message: string, hideMsec: number | undefined = undefined) {
        if (!this.players.includes(player)) return;
        this.broadcast({ action: "sendMessage", seatId: player.seatId, message, hideMsec })
    }

    check(username: string) {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.username !== username) continue;
            if (!player.needAction) return false;
            if (this.gameData.turnSeat !== player.seatId) return false;

            if (player.betNeeded > 0) return false;

            player.needAction = false;
            this.sendMessage(player, `Check`, 2000);

            const nextSeatId = this.pickNextRoundSeatId();
            if (nextSeatId === false) {
                this.setGameStage(this.stage + 1);
                return true;
            }

            this.gameData.turnSeat = nextSeatId as number;
            this.broadcast({
                action: "setPlayerTurn",
                seatId: this.gameData.turnSeat
            });

            return true;
        }
    }

    call(username: string) {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.username !== username) continue;
            if (!player.needAction) return false;
            if (this.gameData.turnSeat !== player.seatId) return false;
            
            const betNeeded = player.betNeeded;

            // TODO: if player has less coins than betNeeded take some action
            if (player.bet(betNeeded)) {
                this.pot = this.pot + betNeeded;
                this.sendMessage(player, `Call ${betNeeded} coins`, 2000);
            }

            player.needAction = false;

            const nextSeatId = this.pickNextRoundSeatId();
            if (nextSeatId === false) {
                this.setGameStage(this.stage + 1);
                return true;
            }

            this.gameData.turnSeat = nextSeatId as number;
            this.broadcast({
                action: "setPlayerTurn",
                seatId: this.gameData.turnSeat
            });
            return true;
        }
    }

    bet(username: string, amount: number) {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.username !== username) continue;
            if (!player.needAction) return false;
            if (this.gameData.turnSeat !== player.seatId) return false;

            if (!player.bet(amount)) {
                return false;
            }

            this.pot = this.pot + amount;
            
            const betNeeded = player.betNeeded;
            this.sendMessage(player, `${betNeeded === 0 ? 'Bet' : 'Raise'} ${amount} coins`, 2000);

            this.players.forEach(ply => {
                if (!ply.playing) return;
                ply.needAction = true;
                ply.betNeeded = ply.betNeeded + amount;
            });

            player.needAction = false;

            this.gameData.turnSeat = this.pickNextRoundSeatId() as number;
            this.broadcast({
                action: "setPlayerTurn",
                seatId: this.gameData.turnSeat
            });
            return true;
        }
    }

    fold(username: string) {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.username !== username) continue;
            if (!player.needAction) return false;
            if (this.gameData.turnSeat !== player.seatId) return false;

            this.sendMessage(player, `Fold`, 2000);
            player.playing = false;
            this.broadcast({
                action: "setPlayerFold",
                seatId: player.seatId
            });

            const remainingPlayers = this.players.reduce((acc, ply) => acc + (ply.playing ? 1 : 0), 0);

            if (remainingPlayers === 1) {
                this.setGameStage(5);
                return true;
            }

            const nextSeatId = this.pickNextRoundSeatId();
            if (nextSeatId === false) {
                this.setGameStage(this.stage + 1);
                return true;
            }

            this.gameData.turnSeat = nextSeatId as number;
            this.broadcast({
                action: "setPlayerTurn",
                seatId: this.gameData.turnSeat
            });

            return true;
        }
    }

    togglePlayerReady(username: string) {

        if (this.stage !== 0) return; // game already started

        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].username !== username) continue;

            const player = this.players[i];

            player.ready = !player.ready;
            this.broadcast({
                action: "togglePlayerReady",
                seatId: player.seatId,
                ready: player.ready
            });

            this.tryToStartGame();

            return player.ready;
        }

        throw new Error(`Player with username ${username} not found at table ${this.id}`);
    }

    dealCards() {
        this.players.forEach(player => {
            player.hand = this.deck.deal(2);

            player.sendData({
                action: "dealCards",
                hand: player.hand
            })
        });

        this.broadcast({ action: "dealPlayerCards" });
    }

    flop() {
        const flop: Card[] = this.deck.deal(3);
        this.cardsOnTable = flop;
        this.broadcast({
            action: "setCardsOnTable",
            cards: this.cardsOnTable
        });
    }

    turn() {
        const turn: Card[] = this.deck.deal(1);
        this.cardsOnTable.push(turn[0]);

        this.broadcast({
            action: "setCardsOnTable",
            cards: this.cardsOnTable
        });
    }

    river() {
        const river: Card[] = this.deck.deal(1);
        this.cardsOnTable.push(river[0]);

        this.broadcast({
            action: "setCardsOnTable",
            cards: this.cardsOnTable
        });
    }

    getWinner() : Player {
        let winner: Player = this.players[0], winnerHandValue = 0;

        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (!player.playing) continue;
            console.log(player.username, player.getHandValueAndName(this.cardsOnTable), player.hand);
            if (player.getHandValue(this.cardsOnTable) > winnerHandValue) {
                winner = player;
                winnerHandValue = player.getHandValue(this.cardsOnTable);
            }
        }

        winner.giveCoins(this.pot);

        this.broadcast({
            action: "winner",
            winner: {
                username: winner.username,
                seatId: winner.seatId,
                winningHand: winner.getHandValueAndName(this.cardsOnTable)
            }
        });

        setTimeout(() => {
            this.reset();
        }, 3000);

        return winner;
    }

    reset() {
        this.players.forEach(player => {
            player.hand = [];
            player._betNeeded = 0;
            player.currentBet = 0;
            player.playing = false;
        });
        this.deck.reset();
        this.cardsOnTable = [];

        this.gameData = defaultGameData;
        this.stage = 0;

        this.broadcast({
            action: "initTable",
            table: this.getInitTableData()
        });
    }

    getTotalPlayers() {
        return this.players.length;
    }
}

export default PokerTable;