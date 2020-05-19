function Player(id, name, cards = []) {
    this.id = id;
    this.name = name;
    this.cards = cards;
}

Player.prototype.setCards = function (cards) {
    this.cards = cards;
}

Player.prototype.addCard = function (card) {
    this.cards = this.cards.concat(card);
}

Player.prototype.removeCard = function (card) {
    const cardIndex = this.cards.indexOf(card);
    this.cards.splice(cardIndex, 1);
}

Player.prototype.clone = function () {
    return Object.assign({}, this);
}

module.exports = Player;