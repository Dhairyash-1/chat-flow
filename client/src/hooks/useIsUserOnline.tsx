import { useMemo } from "react"
import { useChat } from "./useChat"

const useIsUserOnline = (userId: string) => {
  const { onlineUsers } = useChat()
  return useMemo(() => {
    return onlineUsers?.some((user) => user.userId === userId)
  }, [userId, onlineUsers])
}

export default useIsUserOnline
