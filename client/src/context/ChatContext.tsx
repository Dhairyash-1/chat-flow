import { createContext, useState, ReactNode, useEffect } from "react"

import useSocket from "../hooks/useSocket"

import { NEW_MESSAGE } from "../utils/event"

export interface MessageT {
  senderId: string
  content: string
  chatId?: string
  timestamp: string
}

interface ChatContextProps {
  messages: MessageT[]
  activeChat: ChatT | null
  activeChatId: string | null
  isTyping: boolean
  onlineUsers: string[] | null
  userId: string | null
  setUserId: (id: string) => void
  // showChatList: boolean
  setMessages: React.Dispatch<React.SetStateAction<MessageT[]>>
  setActiveChat: (chat: ChatT) => void
  setActiveChatId: (chatId: string) => void
  setIsTyping: (status: boolean) => void
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[] | null>>
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
  const [onlineUsers, setOnlineUsers] = useState<string[] | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return
    const handleNewMessage = (message: MessageT) => {
      console.log("new message from backend")
      setMessages((prev) => [...prev, message])
    }

    socket.on(NEW_MESSAGE, (msg) => {
      handleNewMessage(JSON.parse(msg))
    })

    return () => {
      socket.off(NEW_MESSAGE, handleNewMessage)
    }
  }, [socket])

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
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
