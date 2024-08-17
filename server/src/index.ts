import dotenv from "dotenv"
dotenv.config()
import express, { Request, Response } from "express"
import http from "http"
import { Server } from "socket.io"
import bodyParser from "body-parser"
import { syncUserWithDb } from "./controllers/user.controller"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
  },
})

io.on("connection", (socket) => {
  console.log("A user connected")

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected")
  })
})

// webhook to sync clerk user with db
app.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  syncUserWithDb
)

server.listen(process.env.PORT, () => {
  console.log(`Server is running at Port ${process.env.PORT}`)
})
