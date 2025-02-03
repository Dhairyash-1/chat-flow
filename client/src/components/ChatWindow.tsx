import MessageInput from "./MessageInput"
import MessagesContainer from "./MessagesContainer"

const ChatWindow = () => {
  return (
    <div className="h-full flex flex-col justify-between py-2">
      <MessagesContainer />
      <div className="px-4 py-2 md:px-6 md:py-4 border-t border-[#ececec] sticky bottom-0 bg-white">
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatWindow
