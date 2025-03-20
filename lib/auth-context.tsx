"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  user_type: "client" | "freelancer"
  is_email_verified: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  verifyEmail: (code: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resetPasswordConfirm: (token: string, password: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

type RegisterData = {
  email: string
  password: string
  first_name: string
  last_name: string
  user_type: "client" | "freelancer"
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token")
      const savedUser = localStorage.getItem("user")

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error("Error parsing saved user", error)
        }
      }

      if (token) {
        try {
          // Try to refresh token if we have one
          await refreshToken()
        } catch (refreshError) {
          // If refresh fails, clear tokens
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          localStorage.removeItem("user")
          setUser(null)
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token")

    if (!refreshToken) {
      throw new Error("No refresh token")
    }

    try {
      const response = await api.post("/api/auth/token/refresh/", {
        refresh: refreshToken,
      })

      localStorage.setItem("access_token", response.data.access)
      return response.data.access
    } catch (error) {
      throw error
    }
  }

  const login = async (email: string, password: string, remember = false) => {
    try {
      setIsLoading(true)
      const response = await api.post("/api/auth/login/", { email, password })

      // Store tokens
      localStorage.setItem("access_token", response.data.access)
      localStorage.setItem("refresh_token", response.data.refresh)

      // Store user data from the response
      setUser(response.data.user)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      toast({
        title: "Login successful",
        description: `Welcome back, ${response.data.user.first_name}!`,
      })

      // Redirect based on user type
      if (response.data.user.user_type === "client") {
        router.push("/client/dashboard")
      } else {
        router.push("/freelancer/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.detail || "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)
      // Make sure we're sending the exact fields the backend expects
      const registerData = {
        email: data.email,
        password: data.password,
        password2: data.password, // Add password2 field as required by the API
        first_name: data.first_name,
        last_name: data.last_name,
        user_type: data.user_type,
      }

      const response = await api.post("/api/auth/register/", registerData)

      // If registration returns tokens and user data, store them
      if (response.data.access && response.data.refresh && response.data.user) {
        localStorage.setItem("access_token", response.data.access)
        localStorage.setItem("refresh_token", response.data.refresh)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        setUser(response.data.user)

        // If email is already verified, redirect to dashboard
        if (response.data.user.is_email_verified) {
          if (response.data.user.user_type === "client") {
            router.push("/client/dashboard")
          } else {
            router.push("/freelancer/dashboard")
          }
          return
        }
      }

      toast({
        title: "Registration successful",
        description: "Please check your email for verification instructions.",
      })

      router.push("/verify-email")
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.detail || "Please check your information and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const verifyEmail = async (code: string) => {
    try {
      setIsLoading(true)
      // Update to match the API documentation
      await api.post("/api/auth/verify-email/", { token: code })

      toast({
        title: "Email verified",
        description: "Your email has been successfully verified. You can now log in.",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.response?.data?.detail || "Invalid verification code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true)
      await api.post("/api/auth/password-reset/", { email })

      toast({
        title: "Password reset requested",
        description: "If an account with that email exists, you will receive instructions to reset your password.",
      })

      router.push("/login")
    } catch (error) {
      // Don't show error for security reasons
      toast({
        title: "Password reset requested",
        description: "If an account with that email exists, you will receive instructions to reset your password.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetPasswordConfirm = async (token: string, password: string) => {
    try {
      setIsLoading(true)
      await api.post("/api/auth/password-reset/confirm/", { token, password })

      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.response?.data?.detail || "Invalid or expired token",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true)
      // Update to match the API documentation
      await api.post("/api/auth/change-password/", {
        old_password: currentPassword,
        new_password: newPassword,
      })

      toast({
        title: "Password changed",
        description: "Your password has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.response?.data?.detail || "Please check your current password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        verifyEmail,
        resetPassword,
        resetPasswordConfirm,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

