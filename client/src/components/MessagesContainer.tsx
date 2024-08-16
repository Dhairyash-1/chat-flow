import React from "react"
import Message from "./Message"

const MessagesContainer = () => {
  return (
    <div className="flex-1 flex space-y-4 flex-col overflow-y-scroll no-scrollbar px-6">
      <Message
        text="Hello i want to know more about product design position open at atlassian"
        isOwnMessage={false}
      />
      <Message
        text="Sure, tells us what do you wanna know?"
        isOwnMessage={true}
      />
      <Message
        text="this is my folio i'm working as product desinger at adbobe and i do product realted decision to how to develop and desingn and ship better product that can help"
        isOwnMessage={false}
      />
      <Message text="You've good folio" isOwnMessage={true} />
      <Message text="however we're looking for" isOwnMessage={true} />
    </div>
  )
}

export default MessagesContainer
