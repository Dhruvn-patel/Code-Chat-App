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
const { notFound, errorHandler } = require("./middleware/errorMiddleware")
//middleware
dotenv.config();
connectDB();
app.use(cors())
app.use(express.json())



app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
// app.use("/api/message", messageRoutes);


app.listen(PORT, () => {
    console.log(`Listening PORT ${PORT}`);
})