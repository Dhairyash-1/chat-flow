// import UserProfile from "../components/UserProfile"
import { SignedIn, SignIn, UserButton, useUser } from "@clerk/clerk-react"
import SearchBar from "./SearchBar"
import { BellIcon, Ellipsis } from "lucide-react"
import { Badge } from "./ui/badge"
import NotificationBell from "./NotificationBell"

const Header = () => {
  const { user } = useUser()
  return (
    <>
      <div className="px-6 flex items-center gap-2 py-2 h-[72px]  bg-[#FFFFFF]">
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
              variables: {
                colorPrimary: "#ff7000",
              },
            }}
          />
        </SignedIn>
        <p>{user?.fullName}</p>

        {/* <Ellipsis className="ml-auto" /> */}
        {/* <div className="ml-auto relative">
          <div className="relative cursor-pointer">
            <BellIcon className="w-6 h-6 text-gray-600 hover:text-gray-800 transition duration-200 ease-in-out" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF6448] text-xs font-bold text-white shadow-lg ">
              {5}
            </span>
          </div>
        </div> */}
        <NotificationBell />
      </div>
    </>
  )
}

export default Header
