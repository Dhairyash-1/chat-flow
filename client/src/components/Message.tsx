import { CheckIcon } from "lucide-react"
import { MessageT } from "../context/ChatContext"
import { useChat } from "../hooks/useChat"
import { useEffect, useRef } from "react"
import MessageStatus from "./MessageStatus"

function extractTime(dateString: string) {
  // console.log(dateString)
  const date = new Date(dateString) // Convert the string to a Date object
  const hours = date.getHours().toString().padStart(2, "0") // Format hours with leading zero if needed
  const minutes = date.getMinutes().toString().padStart(2, "0") // Format minutes with leading zero if needed
  return `${hours}:${minutes}` // Return the time in HH:MM format
}

const Message = ({ message }: { message: MessageT }) => {
  const { userId } = useChat()
  const messageRef = useRef<HTMLDivElement | null>(null)
  const isOwnMessage = message.senderId === userId

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            message.senderId !== userId &&
            message.status !== "read"
          ) {
            // emit the message-read event
          }
        }),
      { threshold: 0.8 }
    )

    if (messageRef.current) {
      observer.observe(messageRef.current)
    }

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current)
      }
    }
  }, [message, userId])

  return (
    <div
      className={`px-4 py-2 max-w-xs rounded-lg text-base mb-2 ${
        isOwnMessage
          ? "self-end bg-[#EF6448] text-white"
          : "self-start bg-[#e0e0e0] text-[#424242]"
      }`}
      ref={messageRef}
    >
      <div className="flex justify-between items-end">
        <div>{message.content}</div>
        {/* Render tick icon and time for the sender's message */}
        {isOwnMessage && (
          <div className="flex gap-1 items-center text-xs text-gray-300 ml-2">
            {/* Message time */}
            <span className="text-white">{extractTime(message.createdAt)}</span>
            {/* Tick icon */}
            {/* <span className="text-white mr-1">{<CheckIcon size={16} />}</span> */}
            <MessageStatus status={message.status} />
          </div>
        )}

        {/* Render only time for received messages */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 ml-2">
            {extractTime(message.createdAt)}
          </div>
        )}
      </div>
    </div>
  )
}

export default Message
