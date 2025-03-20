"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Check, CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

type Notification = {
  id: number
  recipient: number
  sender: number
  sender_details: {
    id: number
    email: string
    first_name: string
    last_name: string
    user_type: string
    is_email_verified: boolean
  }
  notification_type: string
  content: string
  is_read: boolean
  related_job: number
  job_details: {
    id: number
    title: string
    description: string
    client: {
      id: number
      email: string
      first_name: string
      last_name: string
      user_type: string
      is_email_verified: boolean
    }
    category: number
    category_name: string
    skills_required: string[]
    budget: string
    job_type: string
    status: string
    created_at: string
    updated_at: string
    total_proposals: number
  }
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/api/notifications/")
      setNotifications(response.data.results)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/api/notifications/unread_count/")
      setUnreadCount(response.data.unread_count)
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await api.post(`/api/notifications/${notificationId}/mark_as_read/`)

      // Update the local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      )

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setIsMarkingRead(true)
      await api.post("/api/notifications/mark_all_as_read/")

      // Update the local state
      setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })))

      // Update unread count
      setUnreadCount(0)

      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    } finally {
      setIsMarkingRead(false)
    }
  }

  const getNotificationLink = (notification: Notification) => {
    switch (notification.notification_type) {
      case "proposal_received":
      case "proposal_accepted":
      case "proposal_rejected":
      case "proposal_withdrawn":
        return `/client/proposals/${notification.related_job}`
      case "job_in_progress":
      case "job_completed":
      case "job_cancelled":
        return `/jobs/${notification.related_job}`
      case "payment_received":
      case "payment_sent":
        return `/payments`
      case "message_received":
        return `/messages/rooms/${notification.related_job}`
      default:
        return "#"
    }
  }

  const formatNotificationType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground">Stay updated with your activity</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead} disabled={isMarkingRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                {isMarkingRead ? "Marking..." : "Mark all as read"}
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // Skeleton loading state
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="relative">
                      <Link
                        href={getNotificationLink(notification)}
                        className="block"
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                      >
                        <div
                          className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${notification.is_read ? "" : "bg-primary/5"}`}
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{formatNotificationType(notification.notification_type)}</h3>
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{notification.content}</p>
                            {notification.job_details && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Job: {notification.job_details.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-8 w-8"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No notifications yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When you receive notifications, they will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

