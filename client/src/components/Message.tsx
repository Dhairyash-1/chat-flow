const Message = ({ text, isOwnMessage }) => {
  return (
    <div
      className={`p-4 max-w-xs rounded-lg text-base ${
        isOwnMessage
          ? "self-end bg-[#EF6448] text-white"
          : "self-start bg-[#f6f6f6] text-[#424242]"
      }`}
    >
      {text}
    </div>
  )
}

export default Message
