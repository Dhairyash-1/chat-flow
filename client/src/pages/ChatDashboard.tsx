import ChatWindowContainer from "../components/ChatWindowContainer"

import ConversationPanel from "../components/ConversationPanel"

const ChatDashboard = () => {
  return (
    <div className="flex w-full bg-white">
      <ConversationPanel />
      <ChatWindowContainer />
    </div>
  )
}

export default ChatDashboard
