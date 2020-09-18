import React, { Component } from 'react';
import io from 'socket.io-client';
import { Row, Col, Button } from 'react-bootstrap'
import './game.css';
import Toast from './Toast.jsx';
import GameEnded from './GameEnded.jsx';

let socket;

class Game extends Component {

    state = {
        users: null,
        user: null,
        otherUsers: null,
        cardsDealt: [],
        userPlaying: null,
        userDealing: null,
        cardRequested: false,
        toast: false,
        winner: null,
        loser: null
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
            let toast = false;
            if (cardRequested)
                toast = true;

            this.setState({ cardRequested, toast });
        });

        socket.on('end', ({ winner, loser }) => {
            this.setState({ winner, loser });
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

    dealCard = (event, index) => {
        if (this.state.userDealing !== this.state.user.id)
            event.preventDefault();

        else {
            if (this.state.cardRequested) {
                const cardValue = this.state.user.cards[index];
                socket.emit('card_deal', cardValue);
            }
        }
    }

    recieveCard = (event, index) => {
        if (this.state.userPlaying !== this.state.user.id) {
            event.preventDefault();
        }

        else {
            socket.emit('player_deal', index);
        }
    }

    getImage = (card) => {
        const URL = `http://localhost:5000/`;
        const ending = '.png';
        return URL + card + ending;
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

    toggleToast = (toast) => {
        this.setState({ toast });
    }

    gameEnded = () => {
        return (
            this.state.winner &&
            this.state.loser
        )
    }

    render() {
        const MIN_PLAYERS_FOR_GAME = 3;

        return (
            this.state.users ?
                <React.Fragment>
                    {
                        this.state.user && this.state.otherUsers ?
                            this.gameEnded() ?
                                <GameEnded loser={this.state.loser} winner={this.state.winner}
                                    users={this.state.users} />
                                :
                                <div className="text-center">
                                    {
                                        this.state.cardRequested &&
                                        <Row className="m-3">
                                            <Col>
                                                <Toast show={this.state.toast} setShow={this.toggleToast}
                                                    message={`Card #${this.state.cardsDealt.length + 1} Requested!`} />
                                            </Col>
                                        </Row>
                                    }
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
                                                                src={this.getImage(card)} onClick={(e) => this.dealCard(e, index)}
                                                                alt={`My Card`} />
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
                                                <img src={this.getImage('back')} className="my-cards"
                                                    onClick={(e) => this.recieveCard(e, index)} key={index}
                                                    alt={card}
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                            :
                            <div className="before-game text-center">
                                {this.getNames()}
                                <div>
                                    {
                                        this.state.users.length < MIN_PLAYERS_FOR_GAME ?
                                            <p className="mb-5">
                                                Waiting for {MIN_PLAYERS_FOR_GAME - this.state.users.length} more players to start...
                                            </p>
                                            :
                                            <div>
                                                <div className="mb-5">
                                                    {
                                                        this.state.users[0].id === this.state.user.id ?
                                                            <Button variant="danger" block onClick={this.startGame}>Start</Button>
                                                            :
                                                            <p>
                                                                Waiting for lobby manager <strong className="text-danger">{this.state.users[0].name}</strong>...
                                                    </p>
                                                    }
                                                </div>
                                            </div>
                                    }
                                    <div>
                                        <img src={this.getImage('0')} className="juha joined"
                                            alt="Juha!" />
                                    </div>
                                </div>
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