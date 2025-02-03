import { useState } from "react"
import useIsUserOnline from "../hooks/useIsUserOnline"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createNewChat } from "../utils/api"
import { useChat } from "../hooks/useChat"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

const AvailableUser = ({ user, chats }: { user: UserT; chats: ChatT[] }) => {
  const { setActiveChatId } = useChat()
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const queryClient = useQueryClient()

  const isUserOnline = useIsUserOnline(user.id)

  const { mutate: createOneToOneChat } = useMutation({
    mutationKey: ["createChat"],
    mutationFn: ({ participantId }: { participantId: string }) =>
      createNewChat(participantId),
    onSuccess: (data) => {
      if (data.message === "Chat already exists") {
        setActiveChatId(data.chat.id)
      } else {
        console.log("create chat", data.chat)
        queryClient.invalidateQueries({ queryKey: ["chats"] })

        queryClient.refetchQueries({ queryKey: ["chats"] }).then(() => {
          setActiveChatId(data.chat.chat.id)
          console.log("activeChatId created", data.chat.chat.id)
        })
      }
      setIsCreatingChat(false)
    },
    onError: () => {
      setIsCreatingChat(false)
    },
  })

  // Handle the start of the conversation
  const handleStartConversation = (participantId: string) => {
    const existingChat = chats?.find(
      (chat) => chat.participants[0].clerkId === participantId
    )
    console.log(existingChat, chats)
    if (existingChat) {
      setActiveChatId(existingChat.id)
    } else {
      setIsCreatingChat(true)

      // If chat doesn't exist, create a new chat
      createOneToOneChat({ participantId })
    }
  }
  return (
    <>
      {isCreatingChat && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-lg font-semibold">
            Creating Chat...
          </div>
        </div>
      )}
      <div
        key={user?.id}
        className="flex flex-col items-center gap-2 py-2 w-20 h-18 cursor-pointer"
        onClick={() => handleStartConversation(user.clerkId)}
      >
        <Avatar
          key={user.id}
          className={`h-12 w-12 ${
            isUserOnline ? "border-2 border-green-500" : "border-none"
          }`}
        >
          <AvatarImage src={user.profilePic} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <h5 className="font-bold text-xs text-center line-clamp-1">
          {user.name}
        </h5>
      </div>
    </>
  )
}

export default AvailableUser
