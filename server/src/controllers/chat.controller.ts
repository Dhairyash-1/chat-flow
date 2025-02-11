// @ts-nocheck
import { db } from "../config/drizzle"
import { NextFunction, Request, RequestHandler, Response } from "express"
import { chatParticipants, chats, messages, users } from "../models/schema"
import { sql, eq, inArray, and, ne, desc, gt } from "drizzle-orm"
import { CustomRequest } from "utils/constant"
import { aliasedTable } from "drizzle-orm"

type CustomRequestHandler = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => Promise<any>
// create new one-to-one and group chat

export const createOneToOneChat = async (req: Request, res: Response) => {
  try {
    const userId = req?.auth?.userId
    if (!userId) return
    const { receiverId } = req.params

    if (!receiverId) {
      return res.status(400).json({ error: "receiverId is required" })
    }

    // Get the current user
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (currentUser.length === 0) {
      return res.status(404).json({ error: "Current user not found" })
    }

    // Get the receiver
    const receiver = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, receiverId))
      .limit(1)

    if (receiver.length === 0) {
      return res.status(404).json({ error: "Receiver does not exist" })
    }

    if (receiver[0].clerkId === userId) {
      return res.status(400).json({ error: "You cannot chat with yourself" })
    }

    // Check if a one-to-one chat already exists between these users
    const existingChats = await db
      .select({
        chatId: chatParticipants.chatId,
      })
      .from(chatParticipants)
      .where(
        and(
          inArray(chatParticipants.userId, [currentUser[0].id, receiver[0].id]),
          eq(chatParticipants.role, "member")
        )
      )

    // Group the results by chatId and check if any chat has exactly 2 participants
    const existingChatIds = [
      ...new Set(existingChats.map((chat) => chat.chatId)),
    ]

    for (const chatId of existingChatIds) {
      const participantsCount = existingChats.filter(
        (chat) => chat.chatId === chatId
      ).length

      if (participantsCount === 2) {
        // Chat already exists
        const existingChat = await db
          .select()
          .from(chats)
          .where(and(eq(chats.id, chatId), eq(chats.isGroupChat, false)))
          .limit(1)

        if (existingChat.length > 0) {
          return res.status(200).json({
            message: "Chat already exists",
            chat: existingChat[0],
          })
        }
      }
    }

    // Create new chat
    const [newChat] = await db
      .insert(chats)
      .values({
        isGroupChat: false,
        createdBy: currentUser[0].id,
      })
      .returning()

    // Add participants
    await db.insert(chatParticipants).values([
      {
        chatId: newChat.id,
        userId: currentUser[0].id,
        role: "member",
      },
      {
        chatId: newChat.id,
        userId: receiver[0].id,
        role: "member",
      },
    ])

    // Fetch the complete chat with participants
    const chatWithParticipants = await db
      .select({
        chat: chats,
        participants: sql<string>`json_agg(json_build_object(
          'id', ${users.id},
          'name', ${users.name},
          'email', ${users.email},
          'profilePic', ${users.profilePic},
          'role', ${chatParticipants.role}
        ))`,
      })
      .from(chats)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .innerJoin(users, eq(chatParticipants.userId, users.id))
      .where(eq(chats.id, newChat.id))
      .groupBy(chats.id)
      .limit(1)

    return res.status(201).json({
      message: "Chat created successfully",
      chat: chatWithParticipants[0],
    })
  } catch (error) {
    console.error("Error creating chat:", error)
    return res.status(500).json({
      error: "An error occurred while creating the chat",
    })
  }
}

export const createGroupChat = async (req: Request, res: Response) => {
  try {
    const userId = req?.auth?.userId
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const { name, participants } = req.body

    // Validate input
    if (!name || !participants || participants.length < 2) {
      return res.status(400).json({
        error: "Group chat requires a name and at least 2 participants",
      })
    }

    // Get current user
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (currentUser.length === 0) {
      return res.status(404).json({ error: "Current user not found" })
    }

    // Validate participants exist
    const participantUsers = await db
      .select()
      .from(users)
      .where(inArray(users.id, participants))

    if (participantUsers.length !== participants.length) {
      return res.status(404).json({ error: "Some participants not found" })
    }

    // Ensure current user is included
    const participantIds = [
      ...new Set([...participantUsers.map((p) => p.id), currentUser[0].id]),
    ]

    // Create group chat
    const [newChat] = await db
      .insert(chats)
      .values({
        isGroupChat: true,
        name,
        createdBy: currentUser[0].id,
      })
      .returning()

    // Add participants
    const chatParticipantsData = participantIds.map((userId) => ({
      chatId: newChat.id,
      userId,
      role: userId === currentUser[0].id ? "admin" : "member",
    }))

    await db.insert(chatParticipants).values(chatParticipantsData)

    // Fetch complete chat with participants
    const chatWithParticipants = await db
      .select({
        chat: chats,
        participants: sql<string>`json_agg(json_build_object(
          'id', ${users.id},
          'name', ${users.name},
          'email', ${users.email},
          'profilePic', ${users.profilePic},
          'role', ${chatParticipants.role}
        ))`,
      })
      .from(chats)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .innerJoin(users, eq(chatParticipants.userId, users.id))
      .where(eq(chats.id, newChat.id))
      .groupBy(chats.id)
      .limit(1)

    return res.status(201).json({
      message: "Group chat created successfully",
      chat: chatWithParticipants[0],
    })
  } catch (error) {
    console.error("Error creating group chat:", error)
    return res.status(500).json({
      error: "An error occurred while creating group chat",
    })
  }
}

export const getAllUserChats = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (currentUser.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    // Create table aliases
    const lastMessage = aliasedTable(messages, "last_msg")
    const senderUser = aliasedTable(users, "sender")
    const messageTable = aliasedTable(messages, "msg")
    const participantTable = aliasedTable(chatParticipants, "cp")
    const otherParticipants = aliasedTable(chatParticipants, "other_cp")
    const otherUsers = aliasedTable(users, "other_users")

    const userChats = await db
      .select({
        chat: {
          id: chats.id,
          isGroupChat: chats.isGroupChat,
          name: chats.name,
          createdAt: chats.createdAt,
          updatedAt: chats.updatedAt,
        },
        // Get participants excluding current user
        participants: sql<any>`json_agg(
          DISTINCT jsonb_build_object(
            'id', ${otherUsers.id},
            'name', ${otherUsers.name},
            'email', ${otherUsers.email},
            'profilePic', ${otherUsers.profilePic},
            'isOnline', ${otherUsers.isOnline},
            'role', ${otherParticipants.role},
            'clerkId', ${otherUsers.clerkId}

          )
        ) FILTER (WHERE ${otherUsers.id} != ${currentUser[0].id}::uuid)`,
        lastMessage: sql<any>`CASE 
          WHEN ${lastMessage.id} IS NOT NULL THEN 
            jsonb_build_object(
              'id', ${lastMessage.id},
              'content', ${lastMessage.content},
              'mediaUrl', ${lastMessage.mediaUrl},
              'createdAt', ${lastMessage.createdAt},
              'sender', jsonb_build_object(
                'id', ${senderUser.id},
                'name', ${senderUser.name},
                'profilePic', ${senderUser.profilePic}
              )
            )
          ELSE NULL 
        END`,
        unreadCount: sql<string>`COUNT(DISTINCT 
          CASE WHEN ${messageTable.createdAt} > ${participantTable.addedAt} 
          AND ${messageTable.senderId} != ${currentUser[0].id}::uuid 
          THEN ${messageTable.id} END)`,
      })
      .from(chats)
      // Join for current user's participation
      .innerJoin(
        participantTable,
        and(
          eq(chats.id, participantTable.chatId),
          eq(participantTable.userId, currentUser[0].id)
        )
      )
      // Join for other participants
      .innerJoin(otherParticipants, eq(chats.id, otherParticipants.chatId))
      // Join for other users' details
      .innerJoin(otherUsers, eq(otherParticipants.userId, otherUsers.id))
      // Join for last message
      .leftJoin(lastMessage, eq(chats.lastMessageId, lastMessage.id))
      // Join for sender details
      .leftJoin(senderUser, eq(lastMessage.senderId, senderUser.id))
      // Join for unread messages
      .leftJoin(
        messageTable,
        and(
          eq(chats.id, messageTable.chatId),
          gt(messageTable.createdAt, participantTable.addedAt)
        )
      )
      .groupBy(
        chats.id,
        chats.lastMessageId,
        lastMessage.id,
        lastMessage.content,
        lastMessage.mediaUrl,
        lastMessage.createdAt,
        senderUser.id,
        senderUser.name,
        senderUser.profilePic
      )
      .orderBy(desc(chats.updatedAt))

    // Format the chats
    const formattedChats = userChats.map((chat) => {
      const participants = chat.participants || []

      return {
        ...chat.chat,
        participants,
        lastMessage: chat.lastMessage,
        unreadCount: Number(chat.unreadCount),
        // For non-group chats, use the other participant's name
        name:
          !chat.chat.isGroupChat && participants[0]
            ? participants[0].name
            : chat.chat.name || "Deleted Chat",
      }
    })

    return res.status(200).json({
      chats: formattedChats,
    })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return res.status(500).json({
      error: "An error occurred while fetching chats",
    })
  }
}
export const deleteChat = (req: Request, res: Response) => {}
