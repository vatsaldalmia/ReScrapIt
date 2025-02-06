import express from 'express'
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.routes.js";
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes.js'
import  scrapRoutes from './routes/scrap.routes.js'

dotenv.config();
connectDB();
const app = express()

app.use(express.json());
app.use(cookieParser());
app.use("/api/message",messageRoutes);
app.use(cors())
app.use(bodyParser.json())

app.use("/auth", authRoutes)

app.use("/api/scrap", scrapRoutes)

app.listen(process.env.PORT || 8000, () => {
    console.log(`Example app listening on port ${process.env.PORT || 8000}`)
})
