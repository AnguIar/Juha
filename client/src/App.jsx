import React from 'react';
import Game from './Game.jsx'
import { Button, Form } from 'react-bootstrap';
import './app.css'

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      joined: false
    }
  }

  enter = () => {
    if (!!this.state.name) {
      this.setState({ joined: true });
    }
  }

  quit = () => {
    this.setState({ joined: false });
  }

  captureEnter = (event) => {
    const ENTER_KEY = 13;
    if (event.keyCode === ENTER_KEY) {
      this.enter();
    }
  }

  randomNames = () => {
    const nicks = [
      'x_N1993R_x',
      'TMitocohondria',
      'THC2014',
      'Li5a 4nn',
      'rolory',
      'KoalaKingZ',
      'BioDick',
      'Take a WinBlow'
    ]

    return nicks[Math.floor(Math.random() * nicks.length)];
  }

  juhaImage = () => {
    return <img src={require('./cards/0.png')} className="juha" alt="Juha!" />
  }

  render() {
    return (
      <div className="d-flex w-100 h-100 p-3 flex-column">
        {
          this.state.joined ?
            <React.Fragment>
              <div className="text-center mb-5"></div>
              <div className="p-3">
                <Game name={this.state.name} quitToMain={this.quit} />
              </div>
              <div className="mt-auto text-center">
                <img src={require('./cards/0.png')} className="juha joined" alt="Juha!" />
              </div>
            </React.Fragment>
            :
            <React.Fragment>
              <div className="text-center mb-5">
                <img src={require('./cards/0.png')} className="juha" alt="Juha!" />
              </div>
              <div className="p-3">
                <Form.Group>
                  <Form.Control size="lg" type="text" placeholder={this.randomNames()} onChange={e => this.setState({ name: e.target.value })} />
                </Form.Group>
                <Form.Group>
                  <Button variant="danger" onClick={this.enter} block>Enter</Button>
                </Form.Group>
              </div>
              <div className="mt-auto"></div>
            </React.Fragment>
        }
      </div>
    )
  }
}

export default App;
