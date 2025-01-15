import React from "react"
import Header from "./Header"
import { Separator } from "./ui/separator"
import SearchBar from "./SearchBar"
import Filter from "./Filter"
import ConversationList from "./ConversationList"

const ChatListSidebar = () => {
  return (
    <div className="flex w-full md:w-[30%] flex-col h-full border-r border-r-[#ececec]">
      <Header />
      <Separator />
      <div className="px-4 flex flex-col">
        <SearchBar />
        <Filter />
      </div>
      <div className="flex-1 overflow-y-auto bg-white px-4">
        <ConversationList />
      </div>
    </div>
  )
}

export default ChatListSidebar
