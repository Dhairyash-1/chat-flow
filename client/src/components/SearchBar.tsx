import SearchIcon from "../assets/search.svg"
const SearchBar = () => {
  return (
    <div
      className={`bg-[#f5f5f5]  mt-2 border-2 border-[#cecece]   flex min-h-[52px] w-full  items-center gap-4 rounded-[10px] px-4 `}
    >
      <img src={SearchIcon} alt="search" />
      <input
        type="text"
        placeholder="Search"
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none bg-transparent shadow-none outline-none w-full"
        onChange={() => {}}
      />
    </div>
  )
}

export default SearchBar
