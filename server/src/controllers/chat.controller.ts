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

// export const startConversation = async (req: Request, res: Response) => {
//   try {
//     const { participantIds } = req.body

//     if (!participantIds?.length || participantIds.length < 2) {
//       return res
//         .status(400)
//         .json({ error: "At least two participant IDs are required." })
//     }

//     const sortedParticipantIds = [...participantIds].sort()

//     const existingConversation = await db
//       .select({
//         id: conversations.id,
//         participantCount: sql`COUNT(DISTINCT ${chatParticipants.userId})`.as(
//           "participantCount"
//         ),
//       })
//       .from(conversations)
//       .innerJoin(
//         chatParticipants,
//         eq(conversations.id, chatParticipants.conversationId)
//       )
//       .where(inArray(chatParticipants.userId, sortedParticipantIds))
//       .groupBy(conversations.id)
//       .having(({ participantCount }) =>
//         eq(participantCount, sortedParticipantIds.length)
//       )
//       .limit(1)
//       .execute()

//     if (existingConversation[0]) {
//       return res.status(200).json({
//         message: "Conversation exists",
//         conversationId: existingConversation[0].id,
//       })
//     }

//     const [conversation] = await db
//       .insert(conversations)
//       .values({
//         isGroupChat: participantIds.length > 2,
//       })
//       .returning()

//     await db.insert(chatParticipants).values(
//       sortedParticipantIds.map((id) => ({
//         conversationId: conversation.id,
//         userId: id,
//       }))
//     )

//     return res.status(201).json({
//       message: "Conversation created",
//       conversation,
//     })
//   } catch (error) {
//     console.error("Error:", error)
//     return res.status(500).json({ error: "Internal Server Error" })
//   }
// }
// export const getUserConversations = async (req: Request, res: Response) => {
//   try {
//     //@ts-ignore
//     const { userId } = req.auth // Remove @ts-ignore if possible

//     const Conversations = await db
//       .select({
//         conversationId: conversations.id,
//         isGroupChat: conversations.isGroupChat,
//         lastMessage: messages.content,
//         lastMessageTime: messages.createdAt,
//         participantId: users.id,
//         clerkId: users.clerkId,
//         participantName: users.name,
//         participantProfilePic: users.profilePic,
//       })
//       .from(conversations)
//       .innerJoin(
//         chatParticipants,
//         eq(conversations.id, chatParticipants.conversationId)
//       )
//       .leftJoin(messages, eq(conversations.lastMessageId, messages.id))
//       .innerJoin(
//         users,
//         and(
//           eq(chatParticipants.userId, users.clerkId),
//           ne(chatParticipants.userId, userId) // Ensure we're not selecting the current user
//         )
//       )
//       .where(eq(chatParticipants.conversationId, conversations.id))
//       .execute()

//     return res.json({ data: Conversations })
//   } catch (error) {
//     console.error(`Error fetching user conversations :`, error)
//     res.status(500).json({ error: "Failed to fetch user conversations" })
//   }
// }

// export const getConversationById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params
//     //@ts-ignore
//     const { userId } = req.auth
//     console.log("param", id)

//     const conv = await db
//       .select({
//         conversationId: conversations.id,
//         isGroupChat: conversations.isGroupChat,
//         lastMessage: messages.content,
//         lastMessageTime: messages.createdAt,
//         participants: users.name,
//         clerkId: users.clerkId,
//         participantProfilePic: users.profilePic,
//       })
//       .from(conversations)
//       .innerJoin(
//         chatParticipants,
//         eq(conversations.id, chatParticipants.conversationId)
//       )
//       .leftJoin(messages, eq(conversations.lastMessageId, messages.id))
//       .innerJoin(
//         users,
//         and(
//           eq(chatParticipants.userId, users.clerkId),
//           ne(chatParticipants.userId, userId) // Ensure we're not selecting the current user
//         )
//       )
//       .where(eq(conversations.id, id))
//       .limit(1)

//     return res.status(200).json({ conv: conv[0] })
//   } catch (error) {
//     console.log(error)
//   }
// }

// export const getAllMessages = async (req: Request, res: Response) => {
//   try {
//     const { convId } = req.params
//     //@ts-ignore
//     const { userId } = req.auth
//     const data = await db
//       .select()
//       .from(messages)
//       .where(eq(messages.conversationId, convId))

//     return res.status(200).json({ messages: data })
//   } catch (error) {}
// }
