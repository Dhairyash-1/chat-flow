import ConversationList from "./ConversationList"
import Header from "./Header"

const ConversationPanel = () => {
  return (
    <div className="w-[30%] flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-y-scroll no-scrollbar">
        <ConversationList />
      </div>
    </div>
  )
}

export default ConversationPanel
