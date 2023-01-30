const cors = require('cors')
const { Server } = require("socket.io");
const express = require('express')
require('dotenv').config()
const http = require("http");

const app = express();
const corsOptions = {
  origin: process.env.PORT,
  credentials: true,
  optionSuccessStatus: 200
}

app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  next();
});
app.use(cors(corsOptions))

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.PORT,
        methods: ["GET", "POST"],
    },
});

const users = [];

const addUser = (name, socketId) => {
    !users.some((user) => user.name === name) &&
        users.push({ name, socketId })
    console.log(users)
}

let cells = Array(8).fill('')

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`User with ID: ${socket.id} joined room: ${room}`);
    });

    socket.on('leave_room', async (room) => {
        let r = room.toString()
        socket.leave(r)
        io.sockets.to(r).emit('leave_opponent', 'Your opponent has left the game')
    })

    socket.on('addUser', (name) => {
        addUser(name, socket.id)
        io.emit('getUsers', users)
    });

    socket.on('winner', (data) => {
        let room = data.room.toString()
        io.sockets.to(room).emit('winner_emit', data)
    })

    socket.on("send_step", (data) => {
        let room = data.room.toString()
        cells = data.cells
        io.sockets.to(room).emit("receive_step", {
            cells: cells,
            room: data.room,
            name: data.name,
            step: data.step,
            turn: data.turn
        });
    });

    socket.on('restart', (data) => {
        let room = data.room.toString()
        cells = data.cells
        socket.to(room).emit('confirm_restart', data)
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});