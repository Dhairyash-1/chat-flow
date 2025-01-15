import { ScrollArea, ScrollBar } from "./ui/scroll-area"

const Filter = () => {
  const isActive = false
  return (
    <ScrollArea className="scrollbar-thin">
      <div className="mt-2 py-2 flex gap-2 bg-white shadow-lg">
        <button
          className={`${
            isActive ? "bg-[#EF6448] text-white " : "bg-white text-[#686868]"
          } border border-[#cecece] px-4 py-1 rounded-full hover:bg-[#EF6448] hover:text-white text-sm`}
        >
          All
        </button>
        <button
          className={`${
            isActive ? "bg-[#EF6448] text-white " : "bg-white text-[#686868]"
          } border border-[#cecece] px-4 py-1 rounded-full hover:bg-[#EF6448] hover:text-white text-sm`}
        >
          Unread
        </button>
        <button
          className={`${
            isActive ? "bg-[#EF6448] text-white " : "bg-white text-[#686868]"
          } border border-[#cecece] px-4 py-1 rounded-full hover:bg-[#EF6448] hover:text-white text-sm`}
        >
          Archived
        </button>
        <button
          className={`${
            isActive ? "bg-[#EF6448] text-white " : "bg-white text-[#686868]"
          } border border-[#cecece] px-4 py-1 rounded-full hover:bg-[#EF6448] hover:text-white text-sm`}
        >
          Blocked
        </button>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export default Filter
