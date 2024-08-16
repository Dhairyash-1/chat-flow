import sendIcon from "../assets/paper-plane.svg"
import attachment from "../assets/attachment.svg"

const MessageInput = () => {
  return (
    <div
      className={`bg-[#f5f5f5] flex min-h-[52px] w-full grow items-center gap-4 rounded-[10px] px-4 py-2 `}
    >
      <input
        type="text"
        placeholder="Type your message here"
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none bg-transparent shadow-none outline-none w-full placeholder:font-normal "
        onChange={() => {}}
      />
      <div className="flex gap-3 items-center justify-end">
        <img src={attachment} className="w-[24px] h-[24px] cursor-pointer" />
        <div className="bg-[#fee7e2] px-4 py-2 rounded-lg ">
          <img src={sendIcon} className="w-[24px] h-[24px] cursor-pointer" />
        </div>
      </div>
    </div>
  )
}

export default MessageInput
