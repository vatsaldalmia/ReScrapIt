import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/index.js';
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js";


dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/message",messageRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})