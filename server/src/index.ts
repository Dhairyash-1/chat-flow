import dotenv from "dotenv"
dotenv.config()
import express, { Request, Response } from "express"
import http from "http"
import { Server } from "socket.io"
import bodyParser from "body-parser"
import { syncUserWithDb } from "./controllers/user.controller"
import { NEW_MESSAGE } from "./utils/constant"
import { clerkMiddleware } from "@clerk/express"

import { db } from "./config/drizzle"
import { messages } from "./models/schema"

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

// Keep the online users in a global map
const onlineUsers = new Map()

io.on("connection", (socket) => {
  // Handle a user coming online
  socket.on("online", (userId) => {
    onlineUsers.set(userId, socket.id)
    console.log(`User ${userId} is online`)
    io.emit("online", Array.from(onlineUsers.keys())) // Broadcast online users
  })

  // Handle joining a room
  socket.on("join_chat", ({ chatId, userId }) => {
    socket.join(chatId)
    console.log(`User ${userId} joined chat ${chatId}`)
  })

  // Handle leaving a room
  socket.on("leave", ({ chatId, userId }) => {
    socket.leave(chatId)
    console.log(`User ${userId} left room ${chatId}`)
  })

  // Handle sending a new message
  socket.on(NEW_MESSAGE, async ({ content, chatId, senderId, timestamp }) => {
    console.log("New message received:", content, "to", chatId)

    io.to(chatId).emit(NEW_MESSAGE, {
      chatId: chatId,
      senderId: senderId,
      content: content,
      timestamp,
    })
  })

  socket.on("typing", ({ chatId, userId, isTyping }) => {
    io.to(chatId).emit("typing", {
      chatId,
      userId,
      isTyping,
    })
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    // Find and remove the user from the onlineUsers map
    const userId = [...onlineUsers.entries()].find(
      ([_, socketId]) => socketId === socket.id
    )?.[0]
    if (userId) {
      onlineUsers.delete(userId)
      console.log(`User ${userId} disconnected`)
    }

    // Broadcast updated online users
    io.emit("online", Array.from(onlineUsers.keys()))
  })
})

import userRouter from "./routes/user.routes"
import chatRouter from "./routes/chat.routes"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/chat", chatRouter)

app.get("/api/v1/health", (req, res) => {
  res.json({ message: "ok" })
})

server.listen(process.env.PORT, () => {
  console.log(`Server is running at Port ${process.env.PORT}`)
})
