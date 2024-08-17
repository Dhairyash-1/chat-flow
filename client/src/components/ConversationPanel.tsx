import ConversationList from "./ConversationList"
import Filter from "./Filter"
import Header from "./Header"

const ConversationPanel = () => {
  return (
    <>
      <div className="w-[30%] flex flex-col h-screen ">
        <Header />
        <Filter />
        <div className="flex-1 overflow-y-scroll no-scrollbar bg-white">
          <ConversationList />
        </div>
      </div>
    </>
  )
}

export default ConversationPanel
