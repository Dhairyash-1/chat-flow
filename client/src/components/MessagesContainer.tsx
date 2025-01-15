import { MessageT } from "../context/ChatContext"
import Message from "./Message"

interface PropType {
  messages: MessageT[]
}

const MessagesContainer = ({ messages }: PropType) => {
  return (
    <div className="flex-1 flex space-y-4 py-4 flex-col overflow-y-scroll no-scrollbar  px-4 md:px-6">
      {messages.length > 0 &&
        messages.map((message, i) => <Message key={i} message={message} />)}
    </div>
  )
}

export default MessagesContainer
