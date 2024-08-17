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
        text="Take this part of letter seriously because it's likely one of your first genuine oppurtunities to make a personal,positive impression on a employer.You want your words to invite them to keep reading and convey why you're the best choice"
        isOwnMessage={false}
      />
      <Message text="You've good folio" isOwnMessage={true} />
      <Message text="Thanks" isOwnMessage={false} />
      <Message
        text="however we're looking for someone more experience"
        isOwnMessage={true}
      />
    </div>
  )
}

export default MessagesContainer
