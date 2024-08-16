import ChatWindowHeader from "./ChatWindowHeader"
import ChatWindow from "./ChatWindow"

const ChatWindowContainer = () => {
  return (
    <div className="flex flex-col w-[70%] h-screen border-l border-l-[#ececec]  ">
      <ChatWindowHeader />
      <ChatWindow />
    </div>
  )
}

export default ChatWindowContainer
