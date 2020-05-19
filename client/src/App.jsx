import React from 'react';
import Game from './Game.jsx'
import { Container, Button } from 'react-bootstrap';

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

  render() {
    return (
      <Container onKeyDown={this.captureEnter}>
        {
          this.state.joined ?
            <Game name={this.state.name} quitToMain={this.quit} />
            :
            <div>
              Your name: <input type="text" id="name" onChange={e => this.setState({ name: e.target.value })} /> <br />
              <Button onClick={this.enter}>Enter</Button>
            </div>
        }
      </Container>
    )
  }
}

export default App;
