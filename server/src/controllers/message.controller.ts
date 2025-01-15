import { db } from "config/drizzle"
import { messages } from "models/schema"

// give only last 3 day messages and only give message if requested user is part of this
export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth
    const allMessage = await db
      .select()
      .from(messages)
      .where(eq(messages.senderId, userId))
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}
