import { axiosInstance } from "./useAxiosInstance"

export const fetchAvailableUsers = async (): Promise<UserT[]> => {
  const res = await axiosInstance.get("/users/online")
  return res.data.users
}

export const fetchAllUserChats = async (): Promise<ChatT[]> => {
  const res = await axiosInstance.get("/chat/chats")
  return res.data.chats
}

export const createNewChat = async (participantId: string) => {
  const res = await axiosInstance.post(`/chat/new/${participantId}`)
  console.log("new", res)
  return res.data
}
