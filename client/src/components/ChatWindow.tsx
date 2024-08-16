import MessageInput from "./MessageInput"
import MessagesContainer from "./MessagesContainer"

const ChatWindow = () => {
  return (
    <div className="h-full flex flex-col justify-between py-2">
      {/* Messages container */}

      <MessagesContainer />

      {/* Message input section */}
      <div className="px-6 py-4 border-t border-[#ececec] sticky bottom-0 bg-white">
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatWindow
