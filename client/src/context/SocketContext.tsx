import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from "react"
import { io, Socket } from "socket.io-client"

interface SocketContextValue {
  socket: Socket | null
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
}

export const SocketContext = createContext<SocketContextValue | undefined>(
  undefined
)

export const SocketProvider: React.FC<{
  userId: string
  children: React.ReactNode
}> = ({ userId, children }) => {
  const socket: Socket | null = useMemo(() => {
    if (!userId) return null

    return io(import.meta.env.VITE_SERVER_URL as string, {
      query: { userId },
      autoConnect: false,
    })
  }, [userId])

  useEffect(() => {
    if (socket) {
      socket.connect()
      console.log("Socket connected for user:", userId)
      socket.emit("online", userId)

      return () => {
        console.log("Socket disconnected for user:", userId)
        socket.disconnect()
        socket.off()
      }
    }
  }, [socket, userId])

  const joinChat = useCallback(
    (chatId: string) => {
      if (!chatId || !socket) {
        console.error(
          "Cannot join chat: Invalid chatId or socket is not connected"
        )
        return
      }
      socket.emit("join_chat", { chatId, userId })
      console.log(`Joined chat: ${chatId}`)
    },
    [socket, userId]
  )

  const leaveChat = useCallback(
    (chatId: string) => {
      if (!chatId || !socket) {
        console.error(
          "Cannot leave chat: Invalid chatId or socket is not connected"
        )
        return
      }
      socket.emit("leave_chat", { chatId, userId })
      console.log(`Left chat: ${chatId}`)
    },
    [socket, userId]
  )

  return (
    <SocketContext.Provider value={{ socket, joinChat, leaveChat }}>
      {children}
    </SocketContext.Provider>
  )
}
