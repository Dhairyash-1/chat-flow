import { useEffect, useState } from "react"
import ChatWindowContainer from "../components/ChatWindowContainer"
import ConversationPanel from "../components/ConversationPanel"
// import { socket } from "../utils/socket"
import Header from "../components/Header"
import Filter from "../components/Filter"
import ConversationList from "../components/ConversationList"
import ChatWindowHeader from "../components/ChatWindowHeader"
import ChatWindow from "../components/ChatWindow"

import { NEW_MESSAGE } from "../utils/event"
import { useAuth } from "@clerk/clerk-react"
import SearchBar from "../components/SearchBar"
import { Separator } from "../components/ui/separator"
import { useChat } from "../hooks/useChat"

import useSocket from "../hooks/useSocket"
import ChatListSidebar from "../components/ChatListSidebar"

const ChatDashboard = () => {
  const { userId } = useAuth()
  const { socket } = useSocket()
  const { setOnlineUsers, showChatList } = useChat()

  const { activeChat, activeChatId, setMessages } = useChat()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on("online", (users: any[]) => {
      // console.log("user online", users)
      setOnlineUsers(users)
    })
  }, [socket, setOnlineUsers, userId])

  useEffect(() => {
    setMessages([])
  }, [activeChatId, setMessages])

  console.log(showChatList)

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-white">
      {/* Sidebar for Conversations (only on large screens) */}
      {!isMobile && <ChatListSidebar />}

      {/* Chat Window */}
      <div className="flex flex-col w-full md:w-[70%] h-full">
        {isMobile && !activeChat ? (
          <ChatListSidebar />
        ) : (
          <>
            {activeChat ? (
              <>
                <ChatWindowHeader />
                <div className="flex-1 overflow-y-auto bg-white">
                  <ChatWindow />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ChatDashboard
