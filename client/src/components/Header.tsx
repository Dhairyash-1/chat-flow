// import UserProfile from "../components/UserProfile"
import { SignedIn, SignIn, UserButton, useUser } from "@clerk/clerk-react"
import SearchBar from "./SearchBar"
import { Ellipsis } from "lucide-react"

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

        <Ellipsis className="ml-auto" />
      </div>
    </>
  )
}

export default Header
