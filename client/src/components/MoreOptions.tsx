import { useState } from "react"
import CreateGroupModal from "./CreateGroupModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Ellipsis } from "lucide-react"

const MoreOptions = () => {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)

  return (
    <>
      {/* Dropdown for More Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded hover:bg-gray-100">
            <Ellipsis className="w-6 h-6 text-gray-600" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {/* Open Group Modal */}
          <DropdownMenuItem onClick={() => setIsGroupModalOpen(true)}>
            Create Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Group Modal */}
      {isGroupModalOpen && (
        <CreateGroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
        />
      )}
    </>
  )
}

export default MoreOptions
