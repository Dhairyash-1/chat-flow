interface ParticipantT {
  id: string
  name: string
  role: "memeber" | "admin"
  email: string
  clerkId: string
  isOnline: boolean
  profilePic: string
}
interface ChatT {
  id: string
  isGroupChat: boolean
  name: string
  createdAt: string
  updatedAt: string
  participants: ParticipantT[]
  lastMessage: any
  unreadCount: number
}
interface UserT {
  id: string
  clerkId: string
  name: string
  username: string
  profilePic: string
  isOnline?: boolean
  createdAt: string
  updatedAt: string
}
