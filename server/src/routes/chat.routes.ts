import {
  createOneToOneChat,
  getAllUserChats,
} from "../controllers/chat.controller"
import express from "express"
import { requireAuth } from "@clerk/express"
const router = express.Router()

router.use(requireAuth())

router.route("/new/:receiverId").post(createOneToOneChat)
router.route("/chats").get(getAllUserChats)
// router.route("/:id").get(getConversationById)
// router.route("/get/messages/:convId").get(getAllMessages)

export default router
