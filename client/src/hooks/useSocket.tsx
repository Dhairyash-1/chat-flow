// import { useEffect, useMemo, useCallback } from "react"
// import { io, Socket } from "socket.io-client"

import { useContext } from "react"
import { SocketContext } from "../context/SocketContext"

// const useSocket = (userId: string) => {
//   // Initialize the socket connection lazily with memoization
//   const socket: Socket = useMemo(
//     () =>
//       io(import.meta.env.VITE_SERVER_URL as string, {
//         autoConnect: false, // Disable autoConnect
//         query: { userId }, // Send userId as a query param for easier identification on the server
//       }),
//     [userId] // Re-initialize if userId changes
//   )

//   // Handle socket connection and disconnection
//   useEffect(() => {
//     if (userId) {
//       socket.connect() // Connect the socket when userId is present

//       console.log("Socket connected for user:", userId)

//       return () => {
//         // Properly disconnect and clean up listeners
//         console.log("Socket disconnected for user:", userId)
//         socket.disconnect()
//         socket.off() // Remove all listeners to avoid memory leaks
//       }
//     }
//   }, [userId, socket])

//   // Memoize `joinChat` to prevent unnecessary re-creations
//   const joinChat = useCallback(
//     (chatId: string) => {
//       if (!chatId || !userId) {
//         console.error("Cannot join chat: Invalid chatId or userId")
//         return
//       }
//       socket.emit("join_chat", { chatId, userId })
//       console.log(`Joined chat: ${chatId}`)
//     },
//     [socket, userId] // Dependency array ensures socket and userId are fresh
//   )

//   // Memoize `leaveChat` to prevent unnecessary re-creations
//   const leaveChat = useCallback(
//     (chatId: string) => {
//       if (!chatId || !userId) {
//         console.error("Cannot leave chat: Invalid chatId or userId")
//         return
//       }
//       socket.emit("leave_chat", { chatId, userId })
//       console.log(`Left chat: ${chatId}`)
//     },
//     [socket, userId]
//   )

//   return { socket, joinChat, leaveChat }
// }

// export default useSocket

const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider")
  return context
}
export default useSocket
