import express from "express";
import { getPublicUser } from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/:id", getPublicUser);

export default router;
