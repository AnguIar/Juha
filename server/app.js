const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const path = require('path');

// const logger = require('morgan');
// app.use(logger('dev'));

const PORT = process.env.PORT || 5000;
const dir = path.join(__dirname, 'game/cards');
const app = express();

app.use(express.static(dir));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
 
const server = http.createServer(app);
const io = socketio(server);
require('./web-socket')(io);

server.listen(PORT, () => {
    console.log(`listening at port ${PORT}`)
});

module.exports = app;
