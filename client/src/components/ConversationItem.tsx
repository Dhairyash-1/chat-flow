import profileIcon from "../assets/profile.webp"

const ConversationItem = () => {
  return (
    <div className="py-4 px-6 flex gap-2 border-t  border-[#ececec] hover:bg-[#ececec] cursor-pointer hover:border-l-4 hover:border-l-[#EF6448]">
      <img
        src={profileIcon}
        className="w-[50px] h-[50px] rounded-full items-start"
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5 items-center">
          <h4 className="font-bold text-base">John</h4>
          <span className="w-[7px] h-[7px] rounded-full bg-[#c0c0c0]"></span>
          <span className="text-[#c0c0c0] text-sm">11 days</span>
        </div>
        <p className="line-clamp-3 text-[#424242]">
          <span className="text-[#c0c0c0]  text-base">Kristine: </span>
          Implement pagination or infinite scrolling. This approach loads data
          in chunks, improving both performance and user experience and It is
          overall good for your website
        </p>
      </div>
    </div>
  )
}

export default ConversationItem
