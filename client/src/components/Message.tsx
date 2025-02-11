import { MessageT } from "../context/ChatContext"
import { useChat } from "../hooks/useChat"
import { useEffect, useRef, useState } from "react"
import MessageStatus from "./MessageStatus"
import ImageViewModal from "./ImageViewModal"
import { Download, FileText } from "lucide-react"

function extractTime(dateString: string) {
  // console.log(dateString)
  const date = new Date(dateString) // Convert the string to a Date object
  const hours = date.getHours().toString().padStart(2, "0") // Format hours with leading zero if needed
  const minutes = date.getMinutes().toString().padStart(2, "0") // Format minutes with leading zero if needed
  return `${hours}:${minutes}` // Return the time in HH:MM format
}

const Message = ({
  message,
  previousMessage,
}: {
  message: MessageT
  previousMessage: MessageT
}) => {
  const { userId } = useChat()
  const messageRef = useRef<HTMLDivElement | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const isOwnMessage = message.senderId === userId
  const { activeChat, availableUsers, userId: currentUserId } = useChat()
  const shouldShowSenderName =
    activeChat?.isGroupChat &&
    previousMessage?.senderId !== message.senderId &&
    message.senderId !== currentUserId

  const handleDocumentClick = async () => {
    if (message.type !== "document") return

    try {
      setIsDownloading(true)
      const response = await fetch(message.content)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      console.log(url)

      // Create link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = message.fileName || "document"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        return <p className="whitespace-pre-wrap">{message.content}</p>

      case "image":
        return <ImageViewModal imgUrl={message.content} />

      case "video":
        return (
          <video
            src={message.content}
            controls
            className="w-96 h-auto rounded-lg shadow-md"
          />
        )

      case "document":
        return (
          <div
            className="flex items-center space-x-3 cursor-pointer hover:bg-black/5 p-2 rounded-md transition-colors"
            onClick={handleDocumentClick}
          >
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.fileName || "file name"}
              </p>
              {/* <p className="text-xs text-gray-500">
                {(message.fileSize / 1024).toFixed(2)} KB
              </p> */}
            </div>
            {isDownloading ? (
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="h-5 w-5 text-gray-500" />
            )}
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col">
      {shouldShowSenderName && (
        <p className="text-sm font-semibold text-gray-700 mb-1">
          {availableUsers.find((user) => user.id === message.senderId)?.name ||
            "Unknown"}
        </p>
      )}
      <div
        className={`px-3 py-2 max-w-xs rounded-lg text-base mb-2 ${
          isOwnMessage
            ? "self-end bg-[#EF6448] text-white"
            : "self-start bg-[#e0e0e0] text-[#424242]"
        }`}
        ref={messageRef}
      >
        <div className="flex flex-col gap-1">
          {renderMessageContent()}

          <div className="flex justify-end items-center text-xs">
            <span className={isOwnMessage ? "text-white/70" : "text-gray-500"}>
              {extractTime(message.createdAt)}
            </span>
            {isOwnMessage && <MessageStatus status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message
