import { FileTextIcon, XIcon } from "lucide-react"
import { useState } from "react"

const DocumentPreview = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const getFileIcon = (fileType: string) => {
    const iconMap = {
      "application/pdf": "text-red-500",
      "application/msword": "text-blue-500",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "text-blue-500",
    }
    return iconMap[fileType] || "text-gray-500"
  }

  const renderDocumentPreview = () => {
    if (!file) return null

    // For PDFs, we'll use an embedded view if possible
    if (file.type === "application/pdf") {
      return (
        <div className="w-96 h-72 border rounded-lg overflow-hidden">
          <iframe
            src={URL.createObjectURL(file)}
            width="100%"
            height="100%"
            className="border-none"
          />
        </div>
      )
    }

    // For Word documents, show a placeholder with file details
    return (
      <div className="w-96 h-72 border rounded-lg flex flex-col items-center justify-center space-y-4 p-4">
        <FileTextIcon size={64} className={getFileIcon(file.type)} />
        <div className="text-center">
          <p className="font-semibold text-gray-700">{file.name}</p>
          <p className="text-sm text-gray-500">
            {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {renderDocumentPreview()}
      <button
        onClick={() => {
          /* Clear file logic */
        }}
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        aria-label="Clear Selection"
      >
        <XIcon size={16} />
      </button>
    </div>
  )
}

export default DocumentPreview
