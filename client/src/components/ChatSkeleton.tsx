const ChatSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="py-4 px-1 flex gap-2 border-t animate-pulse"
        >
          {/* Profile Picture Skeleton */}
          <div className="w-[50px] h-[50px] rounded-full bg-gray-300"></div>

          {/* Chat Details Skeleton */}
          <div className="flex flex-col gap-1.5 w-full">
            {/* Chat Header (Name + Status + Time) */}
            <div className="flex gap-1.5 items-center">
              <div className="h-4 w-24 bg-gray-300 rounded"></div>{" "}
              {/* Chat Name */}
              <div className="w-[7px] h-[7px] rounded-full bg-gray-400"></div>{" "}
            </div>

            {/* Last Message Preview */}
            <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
export default ChatSkeleton
