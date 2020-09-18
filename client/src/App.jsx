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

  randomName = () => {
    const nicks = [
      'N1993R',
      'TMitocohondria',
      'THC2014',
      'rolory',
      'KoalaKingZ',
      'BioDick',
      'Take a WinBlow',
      'F4990T',
      'MyKogInUrViJanna'
    ]

    return nicks[Math.floor(Math.random() * nicks.length)];
  }

  getImage = (card) => {
    const URL = `http://localhost:5000/`;
    const ending = '.png';
    return URL + card + ending;
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
            </React.Fragment>
            :
            <React.Fragment>
              <div className="text-center mb-5">
                <img src={this.getImage('0')} className="juha" alt="Juha!" />
              </div>
              <div className="p-3">
                <Form.Group>
                  <Form.Control size="lg" type="text" placeholder={this.randomName()}
                    onChange={e => this.setState({ name: e.target.value })} />
                </Form.Group>
                <Form.Group>
                  <Button variant="danger" onClick={this.enter} block>Enter</Button>
                </Form.Group>
              </div>
            </React.Fragment>
        }
        <div className="mt-auto"> </div>
      </div>
    )
  }
}

export default App;
