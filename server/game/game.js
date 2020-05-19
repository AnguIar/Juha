const Player = require('./player');
const AMOUNT_OF_EACH_CARD = 4;
const AMOUNT_OF_JOKERS = 1;

function Game(players = []) {
    this.players = players;
    this.currentPlayerDealing = undefined;
    this.currentPlayerPlaying = undefined;
    this.cardsOnTable = [];
}

Game.prototype.addPlayer = function (id, _name) {
    const nameTaken = this.players.find(({ name }) => name === _name);
    if (nameTaken)
        throw new TypeError(`Name is already taken`);

    const player = new Player(id, _name);
    this.players = this.players.concat(player);
    return player;
}

Game.prototype.removePlayer = function (_id) {
    this.players = this.players.filter(player => player.id !== _id);
}

Game.prototype.dealCards = function (cardIndex) {
    const card = this.cardsOnTable[cardIndex];
    this.players[this.currentPlayerPlaying].addCard(card);
    this.cardsOnTable.splice(cardIndex, 1);
    this.players[this.currentPlayerDealing].addCard(this.cardsOnTable);
    this.cardsOnTable = [];

}

Game.prototype.handleEndOfArray = function (index) {
    if (index === this.players.length - 1)
        index = 0;
    else
        index++;

    return index;
}

Game.prototype.nextTurn = function () {
    this.currentPlayerDealing = this.handleEndOfArray(this.currentPlayerDealing);
    this.currentPlayerPlaying = this.handleEndOfArray(this.currentPlayerPlaying);
}

Game.prototype.addCardsOnTable = function (card) {
    this.cardsOnTable.push(card);
    return this.cardsOnTable;
}

Game.prototype.checkEnd = function () {
    const juha = this.players.find(({ cards }) => cards.includes(0));

    for (const { name, cards } of this.players) {
        const min = Math.min.apply(null, cards);
        const max = Math.max.apply(null, cards);

        if (Number(max - min) === (AMOUNT_OF_EACH_CARD - 1)
            && max % 4 === 0) {
            return { winner: name, loser: juha.name };
        }
    }

    return false;
}

Game.prototype.dealCardsToPlayers = function () {
    const AMOUNT_OF_PLAYERS = this.players.length;
    const CARDS_DECK_LENGTH = AMOUNT_OF_PLAYERS * AMOUNT_OF_EACH_CARD + AMOUNT_OF_JOKERS;

    const getCards = () => {
        const cards = [...Array(CARDS_DECK_LENGTH).keys()];

        for (let i = cards.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const temp = cards[i];
            cards[i] = cards[randomIndex];
            cards[randomIndex] = temp;
        }

        return cards;
    }

    const cards = getCards();

    for (let i = 0, j = 0; i < CARDS_DECK_LENGTH - 1; i += AMOUNT_OF_EACH_CARD, j++) {
        this.players[j].addCard(cards.slice(i, AMOUNT_OF_EACH_CARD + i));
    }

    const randPlayer = Math.floor(Math.random() * this.players.length);
    this.currentPlayerDealing = randPlayer;
    this.currentPlayerPlaying = this.handleEndOfArray(randPlayer);

    this.players[randPlayer].addCard(cards.pop());
}

Game.prototype.addCardsToTable = function (card) {
    this.cardsOnTable.push(card);
    this.players[this.currentPlayerDealing].removeCard(card);
}

Game.prototype.clonePlayers = function() {
    return this.players.map(player => player.clone());
}

Game.prototype.otherPlayers = function (_id) {
    const players = this.clonePlayers().filter(player => player.id !== _id);
    for (let player of players) {
        player.cards = Array(player.cards.length).fill().map((_, i) => `card ${++i}`);
    }
    return players;
}

Game.prototype.disconnect = function() {
    this.players = [];
}

module.exports = Game;