import React from "react"
import { Link } from "react-router-dom"

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center  w-full">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-lg text-gray-600">
          Oops! The page you are looking for does not exist.
        </p>
        <Link to="/">
          <button className="mt-6 px-4 py-2 bg-blue-500 text-white text-lg rounded hover:bg-blue-600 transition duration-200">
            Go back home
          </button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
