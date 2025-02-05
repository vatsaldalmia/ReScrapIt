import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes.js'

dotenv.config();
connectDB();

const app = express();
app.use(cors())
app.use(bodyParser.json())

app.use("/auth", authRoutes)

app.listen(process.env.PORT  || 3000, () => {
    console.log(`Example app listening on port ${process.env.PORT || 3000}`)
})