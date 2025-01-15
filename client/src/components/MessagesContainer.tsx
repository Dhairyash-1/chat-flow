import { useQuery } from "@tanstack/react-query"
import { MessageT } from "../context/ChatContext"
import { useChat } from "../hooks/useChat"
import Message from "./Message"
import { fetchChatById } from "../utils/api"
import { useEffect, useRef } from "react"

interface PropType {
  messages: MessageT[]
}

const MessagesContainer = ({ messages }: PropType) => {
  const messageContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={messageContainerRef}
      className="flex-1 flex space-y-4 py-4 flex-col overflow-y-scroll no-scrollbar  px-4 md:px-6"
    >
      {messages.length > 0 &&
        messages.map((message, i) => <Message key={i} message={message} />)}
    </div>
  )
}

export default MessagesContainer
