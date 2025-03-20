"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserTypes?: Array<"client" | "freelancer">
}

export function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && allowedUserTypes && !allowedUserTypes.includes(user.user_type)) {
      // Redirect to appropriate dashboard if user type is not allowed
      if (user.user_type === "client") {
        router.push("/client/dashboard")
      } else {
        router.push("/freelancer/dashboard")
      }
    }
  }, [user, isLoading, router, allowedUserTypes])

  // Show nothing while checking authentication
  if (isLoading || !user) {
    return null
  }

  // If user type is restricted and current user is not allowed
  if (allowedUserTypes && !allowedUserTypes.includes(user.user_type)) {
    return null
  }

  return <>{children}</>
}

