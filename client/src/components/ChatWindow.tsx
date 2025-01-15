import { Dispatch, SetStateAction } from "react"
import MessageInput from "./MessageInput"
import MessagesContainer from "./MessagesContainer"
import { MessageT } from "../context/ChatContext"
import { useChat } from "../hooks/useChat"

const ChatWindow = () => {
  const { messages } = useChat()
  return (
    <div className="h-full flex flex-col justify-between py-2">
      {/* Messages container */}

      <MessagesContainer messages={messages} />

      {/* Message input section */}
      <div className="px-4 py-2 md:px-6 md:py-4 border-t border-[#ececec] sticky bottom-0 bg-white">
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatWindow
