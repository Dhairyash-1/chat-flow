import { CheckIcon } from "lucide-react"

type MessageStatusProps = {
  status: "sent" | "delivered" | "read"
}

const MessageStatus = ({ status }: MessageStatusProps) => {
  return (
    <div className="flex items-center space-x-1">
      {status === "sent" && (
        <span className="text-white">
          <CheckIcon size={16} />
        </span>
      )}
      {status === "delivered" && (
        <>
          <span className="relative">
            <CheckIcon size={16} className="text-white z-10" />
            <CheckIcon
              size={16}
              className="text-white absolute top-[3.5px] left-[1px] z-0"
            />
          </span>
        </>
      )}
      {status === "read" && (
        <>
          <span className="relative">
            <CheckIcon size={16} className="text-blue-500 z-10" />
            <CheckIcon
              size={16}
              className="text-blue-500 absolute top-[3.5px] left-[1px] z-0"
            />
          </span>
        </>
      )}
    </div>
  )
}

export default MessageStatus
