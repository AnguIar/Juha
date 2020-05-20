import React, { Component } from 'react';
import io from 'socket.io-client';
import { Row, Col, Button, Alert } from 'react-bootstrap'
import './game.css';

let socket;

class Game extends Component {

    state = {
        users: null,
        user: null,
        otherUsers: null,
        cardsDealt: [],
        userPlaying: null,
        userDealing: null,
        cardRequested: false
    }

    componentDidMount() {
        socket = io('http://localhost:5000/');
        socket.emit('join', { name: this.props.name }, (error) => {
            alert(error);
            this.props.quitToMain();
        });

        socket.on('refresh_users', users => {
            this.setState({ users });
        });

        socket.on('init_player', user => {
            this.setState({ user });
        });

        socket.on('refresh_others', otherUsers => {
            this.setState({ otherUsers });
        })

        socket.on('deal_cards', cards => {
            this.setState({ user: { ...this.state.user, cards } });
        })

        socket.on('user_turn', ({ userPlaying, userDealing }) => {
            this.setState({ userPlaying, userDealing });
        });

        socket.on('table_cards', cardsDealt => {
            this.setState({ cardsDealt });
            if (this.state.userPlaying === this.state.user.id) {
                if (cardsDealt.length === 3) {
                    socket.emit('player_deal', 2);
                }
            }
        });

        socket.on('premission_to_deal', cardRequested => {
            this.setState({ cardRequested });
        });

        socket.on('card_invalid', () => {
            alert('You can\'t send a card you do not own.');
        });

        socket.on('end', ({ winner, loser }) => {
            console.log(winner, loser)
            alert(`Winner: ${winner}, Loser: ${loser}`);
        });

        socket.on('player_disconnect', player => {
            alert(`player ${player.name} has disconnected. quitting...`);
            window.location.reload();
        });
    }

    componentWillUnmount() {
        socket.emit('disconnect');
        socket.off();
    }

    getNames = () => {
        return (
            <div>
                Players in room: <br />
                {
                    this.state.users.map(e => e.name).join(', ')
                }
            </div>
        )
    }

    startGame = () => {
        socket.emit('start');
    }

    requestCard = (event) => {
        if (this.state.userPlaying !== this.state.user.id)
            event.preventDefault();

        else {
            socket.emit('request_card');
        }
    }

    dealCard = (event) => {
        if (this.state.userDealing !== this.state.user.id)
            event.preventDefault();

        else {
            if (this.state.cardRequested) {
                const cardValue = Number(event.target.alt);
                socket.emit('card_deal', cardValue);
            }
        }
    }

    recieveCard = (event) => {
        if (this.state.userPlaying !== this.state.user.id) {
            event.preventDefault();
        }

        else {
            const cardIndex = event.target.alt.replace(/^\D+/g, '');
            socket.emit('player_deal', Number(cardIndex));
        }
    }

    getImage = (card) => {
        return require('./cards/' + card + '.png');
    }

    getRivalCards = (cards) => {
        return (
            cards.map((card, index) =>
                <img src={this.getImage('back')} key={index} alt={card} />
            )
        )
    }

    getUserRole = (userId) => {
        if (this.state.userDealing === userId)
            return <span className="bg-danger text-white">DEALING</span>

        if (this.state.userPlaying === userId)
            return <span className="bg-success text-white">PLAYING</span>
    }

    render() {
        const MIN_PLAYERS_FOR_GAME = 3;

        return (
            this.state.users ?
                <React.Fragment>
                    {
                        this.state.user && this.state.otherUsers ?
                            <div className="text-center">
                                <Row className="mb-5">
                                    {
                                        this.state.otherUsers.map(user =>
                                            <Col className="deck-border" key={user.id}>
                                                <h4>
                                                    {user.name}{' '}
                                                    {
                                                        this.getUserRole(user.id)
                                                    }
                                                </h4>
                                                <div>
                                                    {this.getRivalCards(user.cards)}
                                                </div>
                                            </Col>
                                        )
                                    }
                                </Row>
                                <Row className="flex-column">
                                    <Col>
                                        <h4>{this.state.user.name} (You) {this.getUserRole(this.state.user.id)}</h4>
                                    </Col>
                                    <Col>
                                        <Row>
                                            {
                                                this.state.user.cards.map((card, index) =>
                                                    <Col key={index}>
                                                        <img className="my-cards"
                                                            src={this.getImage(card)} onClick={this.dealCard} alt={card} />
                                                    </Col>
                                                )
                                            }
                                        </Row>
                                    </Col>
                                </Row>
                                {
                                    this.state.userPlaying === this.state.user.id &&
                                    <Row>
                                        <Col>
                                            <Button variant="success" disabled={this.state.cardRequested}
                                                onClick={this.requestCard} block>Request Card</Button>
                                        </Col>
                                    </Row>
                                }
                                <Row>
                                    <Col>
                                        {this.state.cardsDealt.map((card, index) =>
                                            <img src={this.getImage('back')} className="my-cards" onClick={this.recieveCard} key={index} alt={card} />
                                        )}
                                    </Col>
                                </Row>
                                {
                                    this.state.cardRequested &&
                                    <Row className="mt-3">
                                        <Col>
                                            <Alert variant="info">
                                                Card <strong>#{this.state.cardsDealt.length + 1}</strong> Requested!
                                           </Alert>
                                        </Col>
                                    </Row>
                                }
                            </div>
                            :
                            <div className="before-game">
                                {this.getNames()}
                                {
                                    this.state.users.length < MIN_PLAYERS_FOR_GAME ?
                                        <p>
                                            Waiting for {MIN_PLAYERS_FOR_GAME - this.state.users.length} more players to start...
                                        </p>
                                        :
                                        this.state.users[0].id === this.state.user.id ?
                                            <Button variant="danger" block onClick={this.startGame}>Start</Button>
                                            :
                                            <p>
                                                Waiting for lobby manager <strong className="text-danger">{this.state.users[0].name}</strong>...
                                            </p>
                                }
                            </div>
                    }
                </React.Fragment>
                :
                <div>
                    loading
                </div>
        );
    }
}

export default Game;