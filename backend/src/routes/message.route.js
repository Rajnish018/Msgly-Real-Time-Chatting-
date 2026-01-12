import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteMessage, editMessage, getMessages, getUsersForSidebar, markMessagesAsRead, reactToMessage, replyToMessage, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.patch("/read/:userId", protectRoute, markMessagesAsRead);

router.put("/messages/:id/edit", editMessage);
router.delete("/messages/:id", deleteMessage);
router.post("/messages/:id/reply", replyToMessage);
router.put("/messages/:id/react", reactToMessage);


export default router;
