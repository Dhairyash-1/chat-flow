import { MessageT } from "../context/ChatContext"
import { useChat } from "../hooks/useChat"
import { useEffect, useRef } from "react"
import MessageStatus from "./MessageStatus"
import ImageViewModal from "./ImageViewModal"

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
      className={`px-2 py-2 max-w-xs rounded-lg text-base mb-2 ${
        isOwnMessage
          ? "self-end bg-[#EF6448] text-white"
          : "self-start bg-[#e0e0e0] text-[#424242]"
      } ${message.type === "image" && "cursor-pointer"} `}
      ref={messageRef}
    >
      <div className="flex flex-col gap-1">
        {/* Render Text, Image, or Video Message */}
        {message.type === "text" && (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}

        {message.type === "image" && (
          <ImageViewModal imgUrl={message.content} />
        )}

        {message.type === "video" && (
          <video
            src={message.content}
            controls
            className="w-96 h-auto rounded-lg shadow-md"
          />
        )}

        {/* Message Footer (Time + Status) */}
        <div className="flex justify-end items-end">
          {/* Time & Status for Sender */}
          {isOwnMessage && (
            <div className="flex gap-1 items-center text-xs text-gray-300 ml-2">
              <span className="text-white">
                {extractTime(message.createdAt)}
              </span>
              <MessageStatus status={message.status} />
            </div>
          )}

          {/* Time for Receiver */}
          {!isOwnMessage && (
            <div className="text-xs text-gray-500 ml-2">
              {extractTime(message.createdAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Message
