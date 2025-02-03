import { useState } from "react"
import { BellIcon } from "lucide-react"
import { useChat } from "../hooks/useChat"

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, setNotifications, setActiveChatId } = useChat()

  // const notifications = [
  //   // { id: 1, message: "You have a new message from John." },
  //   // { id: 2, message: "Your order has been shipped!" },
  //   // { id: 3, message: "New comment on your post." },
  // ]

  return (
    <div className="ml-auto relative">
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BellIcon className="w-6 h-6 text-gray-600 hover:text-gray-800 transition duration-200 ease-in-out" />
        {notifications.length > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
            {notifications.length}
          </span>
        )}
      </div>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border-t z-10">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Notifications
            </h3>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.senderId}
                  className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => {
                    setActiveChatId(notification.chatId)
                    setNotifications((prevNotifications) =>
                      prevNotifications.filter(
                        (notif) => notif.chatId !== notification.chatId
                      )
                    )
                  }}
                >
                  <p className="text-sm text-gray-600">
                    {notification.count} {notification.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
