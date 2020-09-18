import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

class GameEnded extends Component {
    render() {
        return (
            <React.Fragment>
                <Row>
                    {
                        this.props.users.map((user) =>
                            <Col xs={12} lg={12 / this.props.users.length} key={user.id}>
                                <Row className="flex-column">
                                    <Col>
                                        <h4>{user.name}</h4>
                                    </Col>
                                    <Col>
                                        {this.props.getCards(user.cards)}
                                    </Col>
                                </Row>
                            </Col>
                        )}
                </Row>
            </React.Fragment>
        );
    }
}

export default GameEnded;