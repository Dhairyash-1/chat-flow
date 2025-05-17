import axios from "axios"
import { useAuth } from "@clerk/clerk-react"

const useAxiosInstance = () => {
  const { getToken } = useAuth()

  const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_SERVER_URL}/api/v1`, // Replace with your API base URL
    withCredentials: true,
  })

  // Request interceptor to attach Clerk token to every request
  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await getToken()

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      // Handle request error
      return Promise.reject(error)
    }
  )

  return axiosInstance
}

export default useAxiosInstance

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api/v1`, // Replace with your API base URL
  withCredentials: true,
})
