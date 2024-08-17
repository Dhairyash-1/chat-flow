import { useAuth } from "@clerk/clerk-react"
import { ReactElement, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Circles } from "react-loader-spinner"

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSignedIn === undefined) return
    if (!isSignedIn) {
      navigate("/sign-in")
    } else {
      setLoading(false)
    }
  }, [isSignedIn, navigate])

  if (loading) return <Circles color="#EF6448" />
  return children
}

export default ProtectedRoute
