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
  showChatList: boolean
  setMessages: React.Dispatch<React.SetStateAction<MessageT[]>>
  setActiveChat: (chat: ChatT) => void
  setActiveChatId: (chatId: string) => void
  setIsTyping: (status: boolean) => void
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[] | null>>
  setShowChatList: (status: boolean) => void
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
  const [showChatList, setShowChatList] = useState(() =>
    window.innerWidth >= 768 ? false : true
  )
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return
    const handleNewMessage = (message: MessageT) => {
      setMessages((prev) => [...prev, message])
    }

    socket.on(NEW_MESSAGE, handleNewMessage)

    return () => {
      socket.off(NEW_MESSAGE, handleNewMessage)
    }
  }, [socket])
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowChatList(true) // Always show chat list on medium and larger screens
      } else {
        setShowChatList(false) // Default behavior for smaller screens
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
        showChatList,
        setShowChatList,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
