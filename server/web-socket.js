const Game = require('./game/game');

const game = new Game();

const webSocketIO = (io) => {
    io.on('connection', (socket) => {

        const refreshUsers = () => {
            io.emit('refresh_users', game.players);
        }

        const refreshOthers = () => {
            game.players.forEach(({ id }) => {
                io.to(id).emit('refresh_others', game.otherPlayers(id));
            });
        }

        const emitTurns = () => {
            io.emit('user_turn', {
                userPlaying: game.players[game.currentPlayerPlaying].id,
                userDealing: game.players[game.currentPlayerDealing].id
            });
        }

        const dealCards = (player) => {
            io.to(player.id).emit('deal_cards', player.cards);

        }

        socket.on('join', ({ name }, callback) => {
            try {
                const player = game.addPlayer(socket.id, name);
                socket.emit('init_player', player);
                refreshUsers();
            } catch (err) {
                return callback(err.message);
            }
        });

        socket.on('start', () => {
            const { players } = game;
            game.dealCardsToPlayers();
            players.forEach(({ id }, index) => {
                io.to(id).emit('init_player', players[index]);
            });
            refreshOthers();
            emitTurns();
        });

        socket.on('request_card', () => {
            io.emit('premission_to_deal', true);
        });

        socket.on('card_deal', cardValue => {
            game.addCardsToTable(cardValue);
            socket.emit('table_cards', game.cardsOnTable);
            dealCards(game.players[game.currentPlayerDealing]);
            socket.broadcast.emit('table_cards', game.cardsOnTable.map((e, i) => `card #${i}`));
            io.emit('premission_to_deal', false);
            refreshOthers();
        });

        socket.on('player_deal', (cardIndex) => {
            game.dealCards(cardIndex);
            dealCards(game.players[game.currentPlayerPlaying]);
            dealCards(game.players[game.currentPlayerDealing]);
            game.nextTurn();
            emitTurns();
            io.emit('table_cards', game.cardsOnTable);
            io.emit('premission_to_deal', false);
            refreshOthers();
            const { winner, loser } = game.checkEnd();

            if (winner)
                io.emit('end', { winner, loser });
        });

        socket.on('disconnect', () => {
            game.removePlayer(socket.id);
            refreshOthers();
        });
    });
}

module.exports = webSocketIO;