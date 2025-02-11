import React from "react"
import {
  FileTextIcon,
  FileIcon,
  FileSpreadsheetIcon,
  XIcon,
} from "lucide-react"

const DocumentPreview = ({ file, isFileSizeExceed }) => {
  const getFileDetails = (fileType: string) => {
    const fileTypeMap = {
      "application/pdf": {
        icon: FileTextIcon,
        color: "text-red-500",
        friendlyName: "PDF Document",
      },
      "application/msword": {
        icon: FileTextIcon,
        color: "text-blue-500",
        friendlyName: "Word Document",
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        {
          icon: FileTextIcon,
          color: "text-blue-500",
          friendlyName: "Word Document",
        },
      "application/vnd.ms-excel": {
        icon: FileSpreadsheetIcon,
        color: "text-green-500",
        friendlyName: "Excel Spreadsheet",
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        icon: FileSpreadsheetIcon,
        color: "text-green-500",
        friendlyName: "Excel Spreadsheet",
      },
      "text/plain": {
        icon: FileSpreadsheetIcon,
        color: "text-gray-500",
        friendlyName: "text file",
      },
    }

    return (
      fileTypeMap[fileType] || {
        icon: FileIcon,
        color: "text-gray-500",
        friendlyName: "Unknown File",
      }
    )
  }

  const renderDocumentPreview = () => {
    if (!file) return null

    const {
      icon: FileIconComponent,
      color,
      friendlyName,
    } = getFileDetails(file.type)

    return (
      <div className="w-96 h-72 border rounded-lg flex flex-col items-center justify-center space-y-4 p-4">
        <FileIconComponent size={64} className={color} />
        <div className="text-center">
          <p className="font-semibold text-gray-700 truncate max-w-full">
            {file.name}
          </p>
          <p
            className={`text-sm ${
              isFileSizeExceed ? "text-red-500" : "text-gray-500"
            }`}
          >
            {(file.size / 1024).toFixed(2)} KB
            <span className="ml-2">{friendlyName}</span>
          </p>
          {isFileSizeExceed && (
            <div className="mt-2 text-center">
              <p className="text-sm text-red-500">
                File size exceeds 10MB limit
              </p>
              <p className="text-sm text-red-500">
                Please upload a file smaller than 10MB
              </p>
            </div>
          )}
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
