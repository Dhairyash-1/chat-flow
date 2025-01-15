import { useState } from "react"
import useAxiosInstance from "../utils/useAxiosInstance"
import { useAuth } from "@clerk/clerk-react"

interface Prop {
  user: {
    id: string
    clerkId: string
    name: string
    online: boolean
    profilePic: string
    email: string
    username: string
    createdAt: string
    updatedAt: string
  }
}

const UserItem = ({ user }: Prop) => {
  const [selected, setSelected] = useState(false)
  const { userId } = useAuth()
  const axiosInstance = useAxiosInstance()
  const isSelected = false
  console.log(user)
  async function handleStartConversation() {
    const res = await axiosInstance.post(`/chat/new`, {
      participantIds: [userId, user.clerkId],
    })
    console.log("conversation", res)
  }
  return (
    <div
      onClick={() => {
        handleStartConversation()
      }}
      className={`py-4 px-6 flex gap-2 border-t  border-[#ececec] hover:bg-[#ececec] cursor-pointer hover:border-l-4 hover:border-l-[#EF6448] ${
        isSelected ? "border-l-[#EF6448] bg-[#ececec]" : ""
      }`}
    >
      <img
        src={user.profilePic}
        className="w-[50px] h-[50px] rounded-full items-start"
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5 items-center">
          <h4 className="font-bold text-base">{user.name}</h4>
          <span className="w-[7px] h-[7px] rounded-full bg-[#c0c0c0]"></span>
        </div>
      </div>
    </div>
  )
}

export default UserItem
