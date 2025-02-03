import { createContext, useState, ReactNode, useEffect } from "react"

import useSocket from "../hooks/useSocket"

import { NEW_MESSAGE } from "../utils/event"

export interface MessageT {
  tempId: number
  id: string
  senderId: string
  receiverId: string
  content: string
  chatId?: string
  createdAt: string
  status: "sent" | "delivered" | "read"
}

interface NotificationT {
  count: number
  message: string
  senderId: string
  chatId: string
}
interface OnlineUserT {
  name: string
  socketId: string
  userId: string
}

interface ChatContextProps {
  messages: MessageT[]
  activeChat: ChatT | null
  activeChatId: string | null
  isTyping: boolean
  onlineUsers: OnlineUserT[] | null
  userId: string | null
  notifications: NotificationT[]
  setUserId: (id: string) => void
  // showChatList: boolean
  setMessages: React.Dispatch<React.SetStateAction<MessageT[]>>
  setActiveChat: (chat: ChatT) => void
  setActiveChatId: (chatId: string | null) => void
  setIsTyping: (status: boolean) => void
  setOnlineUsers: React.Dispatch<React.SetStateAction<OnlineUserT[] | null>>
  setNotifications: React.Dispatch<React.SetStateAction<NotificationT[]>>
  // setShowChatList: (status: boolean) => void
}

export const ChatContext = createContext<ChatContextProps | undefined>(
  undefined
)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<MessageT[]>([])
  const [activeChat, setActiveChat] = useState<ChatT | null>(null)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserT[] | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationT[]>([])
  const { socket, leaveChat } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: MessageT) => {
      console.log("New message from backend")
      setMessages((prev) => [...prev, message])
    }

    const handleUpdateMessageStatus = (updatedMsg: MessageT) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMsg.id ? { ...msg, status: updatedMsg.status } : msg
        )
      )
    }

    socket.on(NEW_MESSAGE, (msg) => {
      const parsedMsg = JSON.parse(msg)
      handleNewMessage(parsedMsg)
      // console.log(userId, parsedMsg.receiverId)

      // if (parsedMsg.status === "read") {
      //   socket.emit("UPDATE_MESSAGE_STATUS", {
      //     ...parsedMsg,
      //     status: "delivered",
      //   })
      // }
    })

    // socket.on("UPDATE_MESSAGE_STATUS", (updatedMsg) => {
    //   const parsedMsg = JSON.parse(updatedMsg)
    //   console.log("update status msg", parsedMsg)
    //   handleUpdateMessageStatus(parsedMsg)
    // })

    socket.on("NEW_MESSAGE_NOTIFICATION", (data) => {
      console.log("new notifica")
      const parsedData = JSON.parse(data)
      setNotifications((notif) => {
        const newNotif = `New messsage from ${parsedData.from}`

        const existingNotif = notif.find(
          (notification) => notification.senderId === parsedData.senderId
        )

        if (existingNotif) {
          existingNotif.count += 1
          return [...notif]
        } else {
          return [
            ...notif,
            {
              message: newNotif,
              count: 1,
              senderId: parsedData.senderId,
              chatId: parsedData.chatId,
            },
          ]
        }
      })
    })

    return () => {
      socket.off(NEW_MESSAGE)
      socket.off("NEW_MESSAGE_NOTIFICATIONP")
      // socket.off("UPDATE_MESSAGE_STATUS")
    }
  }, [socket])

  // useEffect(() => {
  //   if (activeChatId) {
  //     leaveChat(activeChatId)
  //   }
  // }, [activeChatId, leaveChat])

  return (
    <ChatContext.Provider
      value={{
        messages,
        activeChat,
        setMessages,
        setActiveChat,
        activeChatId,
        setActiveChatId,
        isTyping,
        setIsTyping,
        onlineUsers,
        setOnlineUsers,
        userId,
        setUserId,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
