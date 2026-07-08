import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { uploadImage } from "../controllers/upload.controllers.js";

const router = express.Router();

router.post("/image", authMiddleware, uploadImage);

export default router;
