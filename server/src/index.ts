import dotenv from "dotenv"
dotenv.config()
import express, { Request, Response } from "express"
import http from "http"
import { Server } from "socket.io"
import bodyParser from "body-parser"
import { syncUserWithDb } from "./controllers/user.controller"
import { NEW_MESSAGE } from "./utils/constant"
import { clerkMiddleware } from "@clerk/express"
import Redis from "ioredis"
import { produceMessage, startMessageConsumer } from "./services/kafka"

import { db } from "./config/drizzle"
import { messages, users } from "./models/schema"

import cors from "cors"

const app = express()

// webhook to sync clerk user with db
app.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  syncUserWithDb
)
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  })
)

const server = http.createServer(app)
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

const corsOptions = {
  origin: ["http://localhost:5173", process.env.CLIENT_URL as string],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}
app.use(cors(corsOptions))

const io = new Server(server, {
  cors: corsOptions,
})
startMessageConsumer()
const pub = new Redis({
  host: process.env.REDIS_HOST as string,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
})
const sub = new Redis({
  host: process.env.REDIS_HOST as string,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
})
const redisStore = new Redis({
  host: process.env.REDIS_HOST as string,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
})

// Keep the online users in a global map
// const onlineUsers = new Map()
const userChatRooms = new Map()
sub.subscribe("MESSAGES")
sub.subscribe("MESSAGE_STATUS")

io.on("connection", (socket) => {
  // Handle a user coming online
  socket.on("online", async (userId) => {
    const user = await db.select().from(users).where(eq(users.id, userId))
    if (user.length === 0) return

    redisStore.hset(
      "online_users",
      userId,
      JSON.stringify({
        userId: userId,
        socketId: socket.id,
        name: user[0].name,
      })
    )

    // onlineUsers.set(userId, socket.id)
    // console.log(`User ${userId} is online`)
    const onlineUsers = await redisStore.hgetall("online_users")
    io.emit(
      "online",
      Object.keys(onlineUsers).map((id) => JSON.parse(onlineUsers[id]))
    )
    console.log(`User ${user[0].name} is online`)
  })

  // Handle joining a room
  socket.on("join_chat", async ({ chatId, userId }) => {
    socket.join(chatId)
    await redisStore.sadd(`user_chat_rooms:${userId}`, chatId)
    console.log(`User ${userId} joined chat ${chatId}`)
  })

  // Handle leaving a room
  socket.on("leave", async ({ chatId, userId }) => {
    socket.leave(chatId)
    await redisStore.srem(`user_chat_rooms:${userId}`, chatId)
    console.log(`User ${userId} left room ${chatId}`)
  })

  // Handle sending a new message
  socket.on(
    NEW_MESSAGE,
    async ({
      id,
      content,
      status,
      chatId,
      senderId,
      receiverId,
      createdAt,
    }) => {
      console.log("New message received:", content, "to", chatId)

      // io.to(chatId).emit(NEW_MESSAGE, {
      //   chatId: chatId,
      //   senderId: senderId,
      //   content: content,
      //   timestamp,
      // })

      await pub.publish(
        "MESSAGES",
        JSON.stringify({
          id,
          chatId: chatId,
          senderId: senderId,
          receiverId,
          content: content,
          status,
          createdAt,
        })
      )
    }
  )

  socket.on(
    "UPDATE_MESSAGE_STATUS",
    async ({ id, chatId, status, senderId }) => {
      console.log("publish msg status")
      await pub.publish(
        "MESSAGE_STATUS",
        JSON.stringify({ id, chatId, status, senderId })
      )
    }
  )

  socket.on("typing", ({ chatId, userId, isTyping }) => {
    io.to(chatId).emit("typing", {
      chatId,
      userId,
      isTyping,
    })
  })

  // Handle disconnection
  socket.on("disconnect", async () => {
    // Find and remove the user from the onlineUsers map
    const onlineUsers = await redisStore.hgetall("online_users")
    const userId = Object.keys(onlineUsers).find(
      (id) => JSON.parse(onlineUsers[id]).socketId === socket.id
    )
    // const userId = [...onlineUsers.entries()].find(
    //   ([_, socketId]) => socketId === socket.id
    // )?.[0]
    if (userId) {
      await redisStore.hdel("online_users", userId)
      await redisStore.del(`user_chat_rooms:${userId}`)

      console.log(`User ${userId} disconnected`)
    }

    // Broadcast updated online users
    const updatedUsers = await redisStore.hgetall("online_users")
    io.emit(
      "online",
      Object.keys(updatedUsers).map((id) => JSON.parse(updatedUsers[id]))
    )
  })
})

sub.on("message", async (channel, message) => {
  console.log("new msg from redis", channel)
  if (channel === "MESSAGES") {
    const parsedMsg = JSON.parse(message)

    const receiverSocket = JSON.parse(
      (await redisStore.hget("online_users", parsedMsg.receiverId)) as string
    )
    // const receiverRoom = userChatRooms.get(parsedMsg.receiverId)

    const receiverInRoom = await redisStore.sismember(
      `user_chat_rooms:${parsedMsg.receiverId}`,
      parsedMsg.chatId
    )

    console.log("---", receiverInRoom)

    let newMessage = parsedMsg

    if (receiverSocket) {
      newMessage = { ...parsedMsg, status: "delivered" }

      if (receiverInRoom) {
        // Receiver is online and in the chat room, deliver message instantly
        // Emit the updated message to the specified chat room
        io.to(parsedMsg.chatId).emit(NEW_MESSAGE, JSON.stringify(newMessage))
      } else {
        // Receiver is online but not in chat room, send notification
        console.log("sent notification ", receiverSocket.socketId)
        const senderInfo = JSON.parse(
          (await redisStore.hget("online_users", parsedMsg.senderId)) as string
        )

        io.to(receiverSocket.socketId).emit(
          "NEW_MESSAGE_NOTIFICATION",
          JSON.stringify({
            chatId: parsedMsg.chatId,
            senderId: parsedMsg.senderId,
            content: parsedMsg.content,
            from: senderInfo.name,
          })
        )
        io.to(parsedMsg.chatId).emit(NEW_MESSAGE, JSON.stringify(newMessage))
      }
    } else {
      // Receiver is offline store message in queue and sent when receiver comes online
    }

    await produceMessage(newMessage)
  }

  if (channel === "MESSAGE_STATUS") {
    console.log("msg status from redis")
    const parsedMsg = JSON.parse(message)

    io.to(parsedMsg.chatId).emit("UPDATE_MESSAGE_STATUS", message)

    // await produceMessage({...parsedMsg,type:"STATUS_UPDATE"})
  }
})

import userRouter from "./routes/user.routes"
import chatRouter from "./routes/chat.routes"
import { eq } from "drizzle-orm"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/chat", chatRouter)

app.get("/api/v1/health", (req, res) => {
  res.json({ message: "ok" })
})

server.listen(process.env.PORT, () => {
  console.log(`Server is running at Port ${process.env.PORT}`)
})
