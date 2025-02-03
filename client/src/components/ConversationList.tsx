import { useEffect, useState } from "react"
import ConversationItem from "./ConversationItem"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { useAuth } from "@clerk/clerk-react"
import { useChat } from "../hooks/useChat"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchAvailableUsers,
  fetchAllUserChats,
  createNewChat,
} from "../utils/api"

import AvailableUser from "./AvailableUser"
import AvailableUserSkeleton from "./AvailableUserSkeleton"
import ChatSkeleton from "./ChatSkeleton"

const ConversationList = () => {
  const { userId } = useAuth()
  const { setActiveChat, activeChatId, setUserId } = useChat()

  // Fetch available users and chats
  const { data: availableUsers = [], isLoading: isUserLoading } = useQuery({
    queryKey: ["availableUsers"],
    queryFn: fetchAvailableUsers,
  })

  const { data: chats = [], isLoading: isChatLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: fetchAllUserChats,
  })

  useEffect(() => {
    if (availableUsers) {
      const user = availableUsers.find((user) => user.clerkId === userId)
      setUserId(user?.id as string)
    }
  }, [availableUsers, userId, setUserId])

  useEffect(() => {
    if (!activeChatId || !chats?.length) return
    console.log("activeChatId", activeChatId)
    const currentChat = chats.find((chat) => chat.id === activeChatId)
    if (!currentChat) {
      console.error("Error loading chat")
      console.log(
        "debug currentChat",
        currentChat,
        "activeChatId",
        activeChatId
      )
      return
    }
    setActiveChat(currentChat)
  }, [activeChatId, chats, setActiveChat])

  const filteredUsers = availableUsers?.filter(
    (user) => user.clerkId !== userId
  )

  return (
    <div className="flex flex-col mt-2">
      {isUserLoading ? (
        <AvailableUserSkeleton />
      ) : (
        availableUsers?.length > 0 && (
          <div className="py-2">
            <h2 className="text-sm font-semibold">Available Users</h2>
            <ScrollArea className="h-22 overflow-x-auto">
              <div className="flex gap-4">
                {filteredUsers.map((user: UserT) => (
                  <AvailableUser key={user.id} user={user} chats={chats} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )
      )}
      {isChatLoading ? (
        <ChatSkeleton />
      ) : (
        chats?.length > 0 && (
          <>
            <p className="mb-2 text-sm font-semibold">Recent Chats</p>
            {chats.map((chat) => (
              <ConversationItem key={chat.id} chat={chat} />
            ))}
          </>
        )
      )}
    </div>
  )
}

export default ConversationList
