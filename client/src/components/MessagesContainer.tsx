import { useQuery } from "@tanstack/react-query"
import { useChat } from "../hooks/useChat"
import Message from "./Message"
import { fetchChatById } from "../utils/api"
import { useEffect, useRef } from "react"
import MessageSkeleton from "./MessageSkeleton"

const MessagesContainer = () => {
  const { activeChatId, setMessages, messages } = useChat()

  const { data, isLoading: isMessageLoading } = useQuery({
    queryKey: ["message", activeChatId],
    queryFn: () => fetchChatById(activeChatId as string),
    enabled: !!activeChatId,
  })

  useEffect(() => {
    if (data) {
      setMessages(data.messages)
    }
  }, [data, setMessages])

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
      {isMessageLoading ? (
        <MessageSkeleton />
      ) : (
        messages.length > 0 &&
        messages.map((message, i) => (
          <Message
            key={i}
            message={message}
            previousMessage={messages[i - 1]}
          />
        ))
      )}
    </div>
  )
}

export default MessagesContainer
