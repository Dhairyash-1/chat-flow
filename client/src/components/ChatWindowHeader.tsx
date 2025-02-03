import { useEffect, useState } from "react"
import { useChat } from "../hooks/useChat"
import useSocket from "../hooks/useSocket"
import { ChevronLeft } from "lucide-react"
import useIsUserOnline from "../hooks/useIsUserOnline"

const ChatWindowHeader = () => {
  const { socket } = useSocket()

  const { activeChatId, setActiveChatId } = useChat()
  const [isTyping, setIsTyping] = useState(false)
  const { activeChat } = useChat()

  const conversation = activeChat as ChatT
  const { id, profilePic, name, clerkId } = conversation.participants[0]

  useEffect(() => {
    if (!socket) return

    socket.on("typing", ({ chatId, userId, isTyping }) => {
      // console.log(chatId, activeChatId, clerkId, userId)
      if (chatId === activeChatId && userId === clerkId) {
        setIsTyping(isTyping)
      }
    })
  }, [socket, activeChatId, clerkId])

  const isUserOnline = useIsUserOnline(id)

  return (
    <div className="bg-[#f6f6f6] h-[72px] flex gap-4 items-center px-4 py-2">
      <button
        onClick={() => {
          setActiveChatId(null)
        }}
        className=" flex md:hidden items-center gap-1 p-2 bg-white text-black text-sm font-medium rounded-md shadow hover:bg-gray-100 border border-gray-300 transition-all duration-200"
      >
        <ChevronLeft className="w-5 h-5 text-black" />
        Back
      </button>

      <img
        className="w-[50px] h-[50px] rounded-full"
        src={profilePic}
        alt="user"
      />
      <div className="flex flex-col gap-1 relative">
        <h3 className="font-bold text-lg ">{name}</h3>
        <div
          className={`absolute ${
            isUserOnline ? "bg-green-500" : "bg-gray-400"
          } w-[8px] h-[8px] rounded-full top-[10px] -right-4`}
        ></div>
        {isTyping && (
          <p className="font-normal text-base text-[#c0c0c0]">Typing...</p>
        )}
      </div>
    </div>
  )
}

export default ChatWindowHeader
