import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { createSavedSearch, getSavedSearches, deleteSavedSearch } from "../controllers/savedSearch.controllers.js";

const router = express.Router();

router.post("/", authMiddleware, createSavedSearch);
router.get("/", authMiddleware, getSavedSearches);
router.delete("/:id", authMiddleware, deleteSavedSearch);

export default router;
