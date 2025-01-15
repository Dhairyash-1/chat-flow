import { useAuth } from "@clerk/clerk-react"
import { ReactElement, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Circles } from "react-loader-spinner"
import { SocketProvider } from "../context/SocketContext"
import { ChatProvider } from "../context/ChatContext"

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { userId, isLoaded } = useAuth()

  const navigate = useNavigate()

  useEffect(() => {
    if (!userId && isLoaded) {
      navigate("/sign-in")
    }
  }, [userId, navigate, isLoaded])

  if (!isLoaded) return <Circles color="#EF6448" />

  if (userId)
    return (
      <SocketProvider userId={userId}>
        <ChatProvider>{children}</ChatProvider>
      </SocketProvider>
    )
}

export default ProtectedRoute
