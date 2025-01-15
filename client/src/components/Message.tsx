import { useAuth } from "@clerk/clerk-react"
import { MessageT } from "../context/ChatContext"

const Message = ({ message }: { message: MessageT }) => {
  const { userId } = useAuth()

  const isOwnMessage = message.senderId === userId

  return (
    <div
      className={`p-4 max-w-xs rounded-lg text-base ${
        isOwnMessage
          ? "self-end bg-[#EF6448] text-white"
          : "self-start bg-[#e0e0e0] text-[#424242]"
      }`}
    >
      {message.content}
    </div>
  )
}

export default Message
