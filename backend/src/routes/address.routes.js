import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { listAddresses, addAddress, updateAddress, deleteAddress } from "../controllers/address.controllers.js";

const router = express.Router();

router.get("/", authMiddleware, listAddresses);
router.post("/", authMiddleware, addAddress);
router.put("/:id", authMiddleware, updateAddress);
router.delete("/:id", authMiddleware, deleteAddress);

export default router;
