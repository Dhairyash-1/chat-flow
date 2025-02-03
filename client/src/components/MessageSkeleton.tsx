const MessageSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(10)].map((_, index) => {
        const isOwnMessage = index % 2 === 0
        return (
          <div
            key={index}
            className={`px-4 w-40 py-5 max-w-xs rounded-lg text-base mb-2 animate-pulse ${
              isOwnMessage
                ? "self-end bg-[#EF6448]/30"
                : "self-start bg-[#e0e0e0]"
            }`}
          ></div>
        )
      })}
    </div>
  )
}

export default MessageSkeleton
