import React from "react"
import profile from "../assets/profile.webp"

const ChatWindowHeader = () => {
  return (
    <div className="bg-[#f6f6f6] h-[72px] flex gap-4 items-center px-4 py-2">
      <img
        className="w-[50px] h-[50px] rounded-full"
        src={profile}
        alt="user"
      />
      <div className="flex flex-col gap-1 relative">
        <h3 className="font-bold text-lg">John</h3>
        <div className="absolute bg-green-500 w-[8px] h-[8px] rounded-full top-3 -right-4"></div>
        <p className="font-normal text-base text-[#c0c0c0]">Typing...</p>
      </div>
    </div>
  )
}

export default ChatWindowHeader
