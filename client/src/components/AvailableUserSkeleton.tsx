const AvailableUserSkeleton = () => {
  return (
    <div className="flex gap-2">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-2 py-2 w-20 h-18 animate-pulse"
        >
          {/* Avatar Skeleton */}
          <div className="h-12 w-12 rounded-full bg-gray-300"></div>

          {/* Name Skeleton */}
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export default AvailableUserSkeleton
