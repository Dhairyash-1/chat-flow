import { useEffect, useState } from "react"
import ConversationItem from "./ConversationItem"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { useAuth } from "@clerk/clerk-react"
import { useChat } from "../hooks/useChat"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchAvailableUsers,
  fetchAllUserChats,
  createNewChat,
} from "../utils/api"

const ConversationList = () => {
  const { userId } = useAuth()
  const { setActiveChat, setUserId, setActiveChatId, onlineUsers } = useChat()
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const queryClient = useQueryClient()

  // Fetch available users and chats
  const { data: availableUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["availableUsers"],
    queryFn: fetchAvailableUsers,
  })

  const { data: chats = [], isLoading: chatLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: fetchAllUserChats,
  })

  const { mutate: createOneToOneChat } = useMutation({
    mutationKey: ["createChat"],
    mutationFn: ({ participantId }: { participantId: string }) =>
      createNewChat(participantId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      if (data.message === "Chat already exists") {
        const existingChat = chats?.find((chat) => chat.id === data.chat.id)
        setActiveChat(existingChat as ChatT)
        setActiveChatId(data.chat.id)
      } else {
        console.log("create chat", data.chat)
        setActiveChatId(data.chat.id)
        setActiveChat(data.chat) // Use the newly created chat
      }
      setIsCreatingChat(false)
    },
    onError: () => {
      setIsCreatingChat(false)
    },
  })

  useEffect(() => {
    if (availableUsers) {
      const user = availableUsers.find((user) => user.clerkId === userId)
      setUserId(user?.id)
    }
  }, [availableUsers, userId, setUserId])

  // Handle the start of the conversation
  const handleStartConversation = (participantId: string) => {
    const existingChat = chats?.find(
      (chat) => chat.participants[0].clerkId === participantId
    )
    console.log(existingChat, chats)
    if (existingChat) {
      // Chat already exists, set it as active
      setActiveChat(existingChat)
      setActiveChatId(existingChat.id)
    } else {
      setIsCreatingChat(true)

      // If chat doesn't exist, create a new chat
      createOneToOneChat({ participantId })
    }
  }

  if (!availableUsers || !chats) return

  return (
    <div className="flex flex-col mt-2">
      {isCreatingChat && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-lg font-semibold">
            Creating Chat...
          </div>
        </div>
      )}
      {availableUsers?.length > 0 && (
        <div className="py-2">
          <h2 className="text-sm font-semibold">Available Users</h2>
          <ScrollArea className="h-22 overflow-x-auto">
            <div className="flex gap-4">
              {" "}
              {/* Ensure horizontal layout */}
              {availableUsers
                .filter((user) => user.clerkId !== userId)
                .map((user) => (
                  <div
                    key={user?.id}
                    className="flex flex-col items-center gap-2 py-2 w-20 h-18 cursor-pointer"
                    onClick={() => handleStartConversation(user.clerkId)}
                  >
                    <Avatar
                      key={user.id}
                      className={`h-12 w-12 ${
                        onlineUsers?.includes(user.clerkId)
                          ? "border-2 border-green-500"
                          : "border-none"
                      }`}
                    >
                      <AvatarImage src={user.profilePic} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <h5 className="font-bold text-xs text-center line-clamp-1">
                      {user.name}
                    </h5>
                  </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
      {chats?.length > 0 && (
        <>
          <p className="mb-2 text-sm font-semibold">Recent Chats</p>
          {chats.map((chat) => (
            <ConversationItem key={chat.id} chat={chat} />
          ))}
        </>
      )}
    </div>
  )
}

export default ConversationList
