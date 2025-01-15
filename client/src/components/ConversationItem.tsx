import { useChat } from "../hooks/useChat"

interface PropType {
  chat: ChatT
}

const ConversationItem = ({ chat }: PropType) => {
  const {
    activeChat,
    onlineUsers,
    setActiveChat,
    activeChatId,
    setActiveChatId,
  } = useChat()
  console.log(chat)
  const isSelected = activeChatId === chat.id

  console.log(chat, activeChatId, isSelected)
  return (
    <div
      onClick={() => {
        setActiveChat(chat)
        setActiveChatId(chat.id)
      }}
      className={`py-4 px-1 flex gap-2 border-t cursor-pointer ${
        isSelected
          ? "bg-[#ececec] border-l-4 border-l-[#EF6448]"
          : "hover:bg-[#ececec] hover:border-l-4 hover:border-l-[#EF6448] border-[#ececec]"
      }`}
    >
      <img
        src={chat.participants[0].profilePic}
        className="w-[50px] h-[50px] rounded-full items-start"
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5 items-center">
          <h4 className="font-bold text-base">{chat.name}</h4>
          <span
            className={`w-[7px] h-[7px] rounded-full ${
              onlineUsers?.includes(chat.participants[0].clerkId)
                ? "bg-green-500"
                : "bg-gray-400"
            } `}
          ></span>
          {chat.lastMessageTime && (
            <span className="text-[#c0c0c0] text-sm">11 days</span>
          )}
        </div>
        {chat?.lastMessageTime && (
          <p className="line-clamp-3 text-[#424242]">
            <span className="text-[#c0c0c0]  text-base">Kristine: </span>
            {chat.lastMessage}
          </p>
        )}
      </div>
    </div>
  )
}

export default ConversationItem
