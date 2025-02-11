import { useChat } from "../hooks/useChat"
import useIsUserOnline from "../hooks/useIsUserOnline"

interface PropType {
  chat: ChatT
}

const ConversationItem = ({ chat }: PropType) => {
  const { activeChatId, setActiveChatId } = useChat()
  // console.log(chat)
  const isSelected = activeChatId === chat.id

  const isUserOnline = useIsUserOnline(chat.participants[0].id)

  return (
    <div
      onClick={() => {
        setActiveChatId(chat.id)
      }}
      className={`py-4 px-1 flex gap-2 border-t cursor-pointer ${
        isSelected
          ? "bg-[#ececec] border-l-4 border-l-[#EF6448]"
          : "hover:bg-[#ececec] hover:border-l-4 hover:border-l-[#EF6448] border-[#ececec]"
      }`}
    >
      {chat.isGroupChat ? (
        <div className="relative w-[50px] h-[50px]">
          <img
            src={chat.participants[0]?.profilePic}
            className="w-[35px] h-[35px] rounded-full absolute top-0 left-0"
          />
          {chat.participants[1] && (
            <img
              src={chat.participants[1]?.profilePic}
              className="w-[35px] h-[35px] rounded-full absolute bottom-0 right-0 border-2 border-white"
            />
          )}
        </div>
      ) : (
        <img
          src={chat.participants[0]?.profilePic}
          className="w-[50px] h-[50px] rounded-full items-start"
        />
      )}
      <div className="flex flex-col gap-1">
        <div className="flex gap-1.5 items-center">
          <h4 className="font-bold text-base">{chat.name}</h4>
          {chat.isGroupChat && (
            <span className="ml-2 text-xs text-gray-500">
              ({chat.participants.length + 1} members)
            </span>
          )}
          {!chat.isGroupChat && (
            <span
              className={`w-[7px] h-[7px] rounded-full ${
                isUserOnline ? "bg-green-500" : "bg-gray-400"
              } `}
            ></span>
          )}
          {chat.lastMessageTime && (
            <span className="text-[#c0c0c0] text-sm">11 days</span>
          )}
        </div>
        {chat?.lastMessage && (
          <p className="line-clamp-3 text-[#424242]">
            {chat.isGroupChat && (
              <span className="text-[#c0c0c0]  text-base">
                {chat.lastMessage.sender.name}{" "}
              </span>
            )}
            {chat.lastMessage.content}
          </p>
        )}
      </div>
    </div>
  )
}

export default ConversationItem
