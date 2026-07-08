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
import uploadRoutes from './routes/upload.routes.js';
import userRoutes from './routes/user.routes.js';
import offerRoutes from './routes/offer.routes.js';
import orderRoutes from './routes/order.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import disputeRoutes from './routes/dispute.routes.js';
import adminRoutes from './routes/admin.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import savedSearchRoutes from './routes/savedSearch.routes.js';
import reportRoutes from './routes/report.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import addressRoutes from './routes/address.routes.js';
import Message from "./models/message.models.js";
import Chat from "./models/chat.models.js";
import { notify } from "./lib/notify.js";

dotenv.config();
connectDB();
const app = express();

app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());
app.use(cors(
    {
        origin: "*",
        credentials: true
    }
))
app.use(bodyParser.json({ limit: "15mb" }))

app.use("/auth", authRoutes);
app.use("/api/scrap", scrapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/saved-searches", savedSearchRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });
  
    socket.on("send_message", async (data) => {
      const { chatId, sender, text, media } = data;

      const newMessage = new Message({ chatId, sender, text, media });
      await newMessage.save();

      // Keep the chat's last-message preview and ordering fresh.
      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.lastMessage = { text: text || "📎 attachment", sender, createdAt: newMessage.createdAt };
        chat.updatedAt = new Date();
        await chat.save();

        const recipient = chat.members.find((m) => m.toString() !== String(sender));
        if (recipient) {
          notify({
            recipient,
            type: "message",
            title: "New message",
            body: (text || "Sent an attachment").slice(0, 80),
            link: "/dashboard",
          });
        }
      }

      io.to(chatId).emit("receive_message", newMessage);
    });

    // Read receipts: mark the other party's messages as seen and inform them.
    socket.on("mark_seen", async ({ chatId, reader }) => {
      await Message.updateMany(
        { chatId, sender: { $ne: reader }, seen: false },
        { seen: true }
      );
      io.to(chatId).emit("messages_seen", { chatId, reader });
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

server.listen(process.env.PORT || 4000, () => {
    console.log(`Server listening on port ${process.env.PORT || 4000}`)
})
