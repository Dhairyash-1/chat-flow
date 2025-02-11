import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "../components/ui/dialog"
import { Checkbox } from "../components/ui/checkbox"
import { SearchIcon, XIcon } from "lucide-react"
import { useChat } from "../hooks/useChat"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createGroupChat } from "../utils/api"

const CreateGroupModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { availableUsers } = useChat()
  const [groupName, setGroupName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState([])
  const queryClient = useQueryClient()
  // const [isGroupCreating]

  const toggleMemberSelection = (user) => {
    setSelectedMembers(
      (prev) =>
        prev.some((member) => member.id === user.id)
          ? prev.filter((m) => m.id !== user.id) // Remove if already selected
          : [...prev, user] // Add if not selected
    )
  }
  const { mutate: createGroup, isPending } = useMutation({
    mutationFn: ({
      name,
      participants,
    }: {
      name: string
      participants: string[]
    }) => createGroupChat(name, participants),
    onSuccess: (data) => {
      console.log("Group created successfully:", data)
      onClose()

      queryClient.invalidateQueries({ queryKey: ["chats"] })

      // Optionally reset state or close modal here
    },
    onError: (error) => {
      console.error("Error creating group:", error)
    },
  })

  function handleGroupCreate() {
    if (!groupName.trim()) {
      console.error("Group name is required")
      return
    }

    if (selectedMembers.length < 2) {
      console.error("At least 2 members are required to create a group")
      return
    }

    console.log("Creating group with:", selectedMembers)

    const participantsIds = selectedMembers.map((mem) => mem.id)

    // Correct way to use mutate
    const res = createGroup({ name: groupName, participants: participantsIds })
    console.log("creat group", res)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-4 w-[400px] rounded-lg">
        {/* Group Name Input */}
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        {/* Search Users */}
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded"
          />
        </div>

        {/* Selected Members Preview */}
        {selectedMembers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedMembers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-gray-200 px-2 py-1 rounded-full"
              >
                <img
                  src={user.profilePic}
                  className="w-6 h-6 rounded-full"
                  alt={user.name}
                />
                <span className="text-sm">{user.name}</span>
                <XIcon
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => toggleMemberSelection(user)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Available Users List */}
        <div className="max-h-60 overflow-y-auto">
          {availableUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              <img
                src={user.profilePic}
                className="w-8 h-8 rounded-full"
                alt={user.name}
              />
              <span className="text-sm flex-1">{user.name}</span>
              <Checkbox
                checked={selectedMembers.some((m) => m.id === user.id)}
                onCheckedChange={() => toggleMemberSelection(user)}
              />
            </div>
          ))}
        </div>

        {/* Create Group Button */}
        <button
          onClick={handleGroupCreate}
          disabled={groupName.trim() === "" || selectedMembers.length < 2}
          className="w-full mt-3 p-2 bg-[#EF6448] text-white rounded disabled:bg-gray-300"
        >
          {isPending ? "Creating..." : "Create New Group"}
        </button>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGroupModal
