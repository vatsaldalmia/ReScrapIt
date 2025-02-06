import express from "express";
import { addScrap, deleteScrap, searchScrap } from "../controllers/scrap.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();


router.post("/add", authMiddleware, addScrap);

router.delete("/delete/:id", authMiddleware, deleteScrap);

router.get("/search", searchScrap);

export default router;
