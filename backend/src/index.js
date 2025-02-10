import express from 'express'
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from './routes/auth.routes.js';
import  scrapRoutes from './routes/scrap.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import Message from "./models/message.models.js";

dotenv.config();
connectDB();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: "*",
        credentials: true
    }
))
app.use(bodyParser.json())

app.use("/auth", authRoutes);
app.use("/api/scrap", scrapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });
  
    socket.on("send_message", async (data) => {
      const { chatId, sender, text } = data;
      
      const newMessage = new Message({ chatId, sender, text });
      await newMessage.save();
  
      io.to(chatId).emit("receive_message", newMessage);
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server listening on port ${process.env.PORT || 4000}`)
})
