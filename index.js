const express = require('express')
const cors = require('cors')
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors())

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
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

    socket.on('leave_room', (room) => {
        socket.leave(room)
    })

    socket.on('addUser', (name) => {
        addUser(name, socket.id)
        io.emit('getUsers', users)
    });

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