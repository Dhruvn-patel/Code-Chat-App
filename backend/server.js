const express = require('express');
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require('./config/db');
const userRoutes = require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const messageRoutes = require("./routes/messageRoutes")

const app = express();
const PORT = process.env.PORT || 4050;

//middleware
dotenv.config();
connectDB();
app.use(cors())
app.use(express.json())



app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);


const server = app.listen(PORT, () => {
    console.log(`Listening PORT ${PORT}`);
})

const io = require('socket.io')(server, {
    pingTimeOut: 7000, //connection close not get message
    cors: {
        origin: 'http://localhost:3000'
    }
})


io.on('connection', (socket) => {
    console.log("connected so");

    socket.on("setup", (user) => {
        console.log(user._id);
        socket.join(user._id)
        socket.emit("connection")
    })

    socket.on("joinchat", (room) => {
        socket.join(room)
        console.log("joined room !" + room)
    })

    // typing
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
    /* realtime chat */
    socket.on("newMsg", (msgRecieved) => {
        let chat = msgRecieved.chat;
        if (!chat.users) return console.log("users not defined");


        chat.users.forEach((user) => {
            /* msg */
            if (user._id === msgRecieved.sender._id) return;
            console.log(chat.users);
            socket.in(user._id).emit("receviedmsg", msgRecieved)
        });
    })

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(user._id);
    });
})
