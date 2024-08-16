const Filter = () => {
  const isActive = false
  return (
    <div className="mt-2  py-2  flex gap-2">
      <button
        className={`${
          isActive ? "bg-[#EF6448] text-white " : "bg-white text-[#686868]"
        }border border-[#f3f4f6] px-4 py-1 rounded-full hover:bg-[#EF6448] hover:text-white text-base`}
      >
        All
      </button>
      <button
        className={`${
          isActive ? "bg-[#EF6448] text-white " : "bg-white text-[#686868]"
        }border border-[#cecece] px-4 py-1 rounded-full hover:bg-[#EF6448] hover:text-white text-base`}
      >
        Unread
      </button>
      <button
        className={`${
          isActive ? "bg-[#EF6448] text-white " : "bg-white text-[#686868]"
        }border border-[#cecece] px-4 py-1 rounded-full hover:bg-[#EF6448] hover:text-white text-base`}
      >
        Archived
      </button>
      <button
        className={`${
          isActive ? "bg-[#EF6448] text-white " : "bg-white text-[#686868]"
        }border border-[#cecece] px-4 py-1 rounded-full hover:bg-[#EF6448] hover:text-white text-base`}
      >
        Blocked
      </button>
    </div>
  )
}

export default Filter
