import { useRef, useState } from "react"
import attachment from "../assets/attachment.svg"
import sendIcon from "../assets/paper-plane.svg"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { FileIcon, ImageIcon, Loader2Icon, XIcon } from "lucide-react"
import DocumentPreview from "./DocumentPreview"
import { useChat } from "../hooks/useChat"
import useSocket from "../hooks/useSocket"
import { MessageT } from "../context/ChatContext"
import { NEW_MESSAGE } from "../utils/event"
import axios from "axios"

const AttachmentDropdown = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isFileSizeExceed, setIsFileSizeExceed] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const { activeChatId, activeChat, userId } = useChat()
  const { socket } = useSocket()
  const [Loading, setLoading] = useState(false)

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      setSelectedFile(file)
      console.log("file", file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      if (file.size > 10 * 1024 * 1024) {
        setIsFileSizeExceed(true)
      } else {
        setIsFileSizeExceed(false)
      }
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (docInputRef.current) docInputRef.current.value = ""
  }

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    )

    try {
      setLoading(true)
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      // Store the secure URL returned by Cloudinary
      setLoading(false)
      return response.data.secure_url
    } catch (error) {
      console.error("Upload failed", error)
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !activeChatId) return
    if (!socket) {
      console.error("Socket is disconnected. Unable to send message.")
      return
    }
    const url = await uploadToCloudinary(selectedFile)

    let fileType: "image" | "video" | "document" | "voice" | "text"

    if (selectedFile.type.startsWith("image")) {
      fileType = "image"
    } else if (selectedFile.type.startsWith("video")) {
      fileType = "video"
    } else {
      fileType = "document"
    }

    const msgData: MessageT = {
      id: "",
      type: fileType,
      tempId: Date.now(),
      chatId: activeChatId,
      senderId: userId as string,
      receiverId: activeChat?.participants[0].id as string,
      content: url,
      status: "sent",
      createdAt: new Date().toISOString(),
    }

    socket.emit(NEW_MESSAGE, msgData)

    setSelectedFile(null)
  }

  const renderFilePreview = () => {
    if (!selectedFile || !previewUrl) return null

    return (
      <div className="relative">
        {isFileSizeExceed && (
          <div className="mb-2 text-center">
            <p className="text-sm text-red-500">File size exceeds 10MB limit</p>
            <p className="text-sm text-red-500">
              Please upload a file smaller than 10MB
            </p>
          </div>
        )}
        {selectedFile.type.startsWith("image") && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-96 h-72 object-contain rounded-lg "
          />
        )}
        {selectedFile.type.startsWith("video") && (
          <video
            src={previewUrl}
            controls
            className="w-96 h-72 rounded-lg shadow-md"
          />
        )}
        {!selectedFile.type.startsWith("video") &&
          !selectedFile.type.startsWith("image") && (
            <DocumentPreview
              file={selectedFile}
              isFileSizeExceed={isFileSizeExceed}
            />
          )}
        <button
          onClick={clearSelection}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          aria-label="Clear Selection"
        >
          <XIcon size={16} />
        </button>
        <button
          onClick={handleSendMessage}
          disabled={Loading || isFileSizeExceed}
          className={`
        flex absolute bottom-2 right-2 items-center justify-center 
        rounded-full bg-[#fee7e2] shadow-md hover:bg-[#fcd2c8] 
        w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 p-2
        transition-all duration-300 ease-in-out
        ${
          Loading || isFileSizeExceed
            ? "cursor-not-allowed opacity-70"
            : "hover:scale-105"
        }
      `}
          aria-label="Send Message"
        >
          {Loading ? (
            <div className="flex items-center space-x-1">
              <Loader2Icon className="animate-spin text-gray-600" size={20} />
              {/* <span className="text-xs text-gray-600">Sending...</span> */}
            </div>
          ) : (
            <img
              src={sendIcon}
              className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
              alt="Send"
            />
          )}
        </button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 w-10 h-10 p-2 transition-colors"
          aria-label="Attach File"
        >
          <ImageIcon className="w-5 h-5 text-gray-600" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[450px] p-4 bg-white shadow-xl rounded-lg space-y-3 mr-2">
        {/* File Selection Options */}
        {!selectedFile && (
          <>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
              onSelect={(e) => {
                e.preventDefault()
                fileInputRef.current?.click()
              }}
            >
              <div className="flex items-center space-x-3">
                <ImageIcon className="text-blue-500" />
                <span className="text-sm text-gray-700">
                  Select Photo or Video
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
              onSelect={(e) => {
                e.preventDefault()
                docInputRef.current?.click()
              }}
            >
              <div className="flex items-center space-x-3">
                <FileIcon className="text-green-500" />
                <span className="text-sm text-gray-700">Select Document</span>
              </div>
              <input
                ref={docInputRef}
                type="file"
                accept="application/*, .doc, .docx, .pdf, .xls, .xlsx, .ppt, .pptx, .txt, .rtf"
                onChange={handleFileChange}
                className="hidden"
              />
            </DropdownMenuItem>
          </>
        )}

        {/* File Preview Section */}
        {selectedFile && previewUrl && (
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm text-gray-600 truncate max-w-full">
              {selectedFile.name}
            </p>
            {renderFilePreview()}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AttachmentDropdown
