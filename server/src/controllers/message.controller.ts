import { db } from "../config/drizzle"
import { asc, eq } from "drizzle-orm"
import { Request, Response } from "express"
import { messages } from "../models/schema"

// give only last 3 day messages and only give message if requested user is part of this
// export const getAllMessages = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.auth
//     const allMessage = await db
//       .select()
//       .from(messages)
//       .where(eq(messages.senderId, userId))
//       .orderBy(asc(messages.createdAt))
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" })
//   }
// }
export const getMessageByChatId = async (req: Request, res: Response) => {
  try {
    // const { userId } = req.auth
    const { chatId } = req.params
    const allMessage = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt))

    return res.status(200).json({ messages: allMessage })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}
