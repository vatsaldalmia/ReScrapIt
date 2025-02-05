import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js";
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes.js'

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/message",messageRoutes);
app.use(cors())
app.use(bodyParser.json())

app.use("/auth", authRoutes)

app.listen(process.env.PORT  || 3000, () => {
    console.log(`Example app listening on port ${process.env.PORT || 3000}`)
})