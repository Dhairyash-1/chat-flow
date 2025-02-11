import {
  createGroupChat,
  createOneToOneChat,
  getAllUserChats,
} from "../controllers/chat.controller"
import express from "express"
import { requireAuth } from "@clerk/express"
import { getMessageByChatId } from "../controllers/message.controller"
const router = express.Router()

router.use(requireAuth())

router.route("/new/:receiverId").post(createOneToOneChat)
router.route("/group/new/").post(createGroupChat)
router.route("/chats").get(getAllUserChats)
router.route("/:chatId/message").get(getMessageByChatId)
// router.route("/:id").get(getConversationById)
// router.route("/get/messages/:convId").get(getAllMessages)

export default router
