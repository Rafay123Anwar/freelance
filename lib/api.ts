import axios from "axios"

// Base URL configuration
// const BASE_URL = "http://localhost:8000"
const BASE_URL = "https://backend-xi-beige.vercel.app/"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // console.log(token)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")

        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = "/login"
          return Promise.reject(error)
        }

        // Try to refresh the token
        const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        // Store the new access token
        localStorage.setItem("access_token", response.data.access)

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh token is invalid, redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

