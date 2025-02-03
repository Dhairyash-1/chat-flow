import sendIcon from "../assets/paper-plane.svg"
import attachment from "../assets/attachment.svg"
import { useEffect, useState, useRef, act } from "react"
import { NEW_MESSAGE } from "../utils/event"
import useSocket from "../hooks/useSocket"

import { useAuth } from "@clerk/clerk-react"
import { MessageT } from "../context/ChatContext"
import { useChat } from "../hooks/useChat"

const MessageInput = () => {
  const { setIsTyping, userId, activeChatId, activeChat } = useChat()
  const { socket, joinChat, leaveChat } = useSocket()
  const [newMessage, setNewMessage] = useState<string>("")
  const previousChatId = useRef<string | null>(null)

  // Handle joining and leaving chat rooms
  useEffect(() => {
    if (!socket) return
    if (activeChatId) {
      if (previousChatId.current !== activeChatId) {
        if (previousChatId.current) {
          leaveChat(previousChatId.current) // Leave the previous room
        }
        joinChat(activeChatId) // Join the new room
        previousChatId.current = activeChatId // Update the current chat ID
      }

      // Handle typing events
      const handleTyping = ({
        userId,
        isTyping,
      }: {
        userId: string
        isTyping: boolean
      }) => {
        setIsTyping(isTyping)
      }
      socket.on("typing", handleTyping)

      return () => {
        socket.off("typing", handleTyping)
      }
    }
  }, [activeChatId, userId, joinChat, leaveChat, setIsTyping, socket])

  // Handle new messages
  // useEffect(() => {
  //   if (!socket) return
  //   const handleNewMessage = (message: MessageT) => {
  //     if (message.chatId === activeChatId) {
  //       console.log("rec", message)
  //       setMessages((prev) => [...prev, message])
  //     }
  //   }

  //   socket.on(NEW_MESSAGE, handleNewMessage)

  //   return () => {
  //     socket.off(NEW_MESSAGE, handleNewMessage)
  //   }
  // }, [socket, setMessages, activeChatId])

  // Debounce typing events to reduce frequency
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    if (!socket) return
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    socket.emit("typing", { chatId: activeChatId, userId, isTyping: true })

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { chatId: activeChatId, userId, isTyping: false })
    }, 1000) // Debounce typing events by 1 second
  }

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChatId) return
    if (!socket) {
      console.error("Socket is disconnected. Unable to send message.")
      return
    }

    const msgData: MessageT = {
      id: "",
      tempId: Date.now(),
      chatId: activeChatId,
      senderId: userId as string,
      receiverId: activeChat?.participants[0].id as string,
      content: newMessage,
      status: "sent",
      createdAt: new Date().toISOString(),
    }

    socket.emit(NEW_MESSAGE, msgData)

    setNewMessage("")
  }

  return (
    <form
      className="bg-[#f5f5f5] flex min-h-[52px] w-full grow items-center gap-4 rounded-[10px] px-4 py-2"
      onSubmit={handleSendMessage}
    >
      <input
        type="text"
        placeholder="Type your message here"
        value={newMessage}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none bg-transparent shadow-none outline-none flex-1 placeholder:font-normal"
        onChange={handleTypingChange}
      />
      <div className="flex gap-3 items-center">
        {/* Attachment Button */}
        <button
          className="flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 
                 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 p-2"
          aria-label="Attach File"
        >
          <img
            src={attachment}
            className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 cursor-pointer"
            alt="Attach"
          />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          className="flex items-center justify-center rounded-full bg-[#fee7e2] shadow-md hover:bg-[#fcd2c8] 
                 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 p-2"
          aria-label="Send Message"
        >
          <img
            src={sendIcon}
            className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 cursor-pointer"
            alt="Send"
          />
        </button>
      </div>
    </form>
  )
}

export default MessageInput
