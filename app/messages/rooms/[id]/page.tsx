"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Send, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

const messageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
})

type Message = {
  id: number
  chat_room: number
  sender: number
  sender_details: {
    id: number
    email: string
    first_name: string
    last_name: string
    user_type: string
    is_email_verified: boolean
  }
  content: string
  is_read: boolean
  created_at: string
}

type ChatRoom = {
  id: number
  job: number
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
  participants: number[]
  participants_details: {
    id: number
    email: string
    first_name: string
    last_name: string
    user_type: string
    is_email_verified: boolean
  }[]
  last_message: {
    id: number
    content: string
    sender: number
    created_at: string
  }
  unread_count: number
  created_at: string
}

export default function ChatRoomPage() {
  const { user } = useAuth()
  const params = useParams()
  const roomId = params.id
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  })

  useEffect(() => {
    if (roomId) {
      fetchChatRoom()
      fetchMessages()
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatRoom = async () => {
    try {
      const response = await api.get(`/api/messages/rooms/${roomId}/`)
      setChatRoom(response.data)
    } catch (error) {
      console.error("Error fetching chat room:", error)
      toast({
        title: "Error",
        description: "Failed to load chat room",
        variant: "destructive",
      })
    }
  }

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/api/messages/rooms/${roomId}/messages/`)
      setMessages(response.data.results)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function onSubmit(values: z.infer<typeof messageSchema>) {
    if (!values.content.trim()) return

    try {
      setIsSending(true)
      const response = await api.post(`/api/messages/rooms/${roomId}/messages/`, {
        chat_room : roomId ,
        content: values.content,
      })

      // Add the new message to the list
      setMessages([...messages, response.data])

      // Reset the form
      form.reset()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getOtherParticipant = () => {
    if (!chatRoom || !user) return null

    return chatRoom.participants_details.find((p) => p.id !== user.id)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-10rem)]">
          {/* Chat header */}
          <Card className="mb-4">
            <CardHeader className="py-3">
              {isLoading || !chatRoom ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>
                      {getOtherParticipant()?.first_name} {getOtherParticipant()?.last_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{chatRoom.job_details.title}</p>
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Messages area */}
          <Card className="flex-1 mb-4 overflow-hidden">
            <CardContent className="p-4 h-full overflow-y-auto">
              {isLoading ? (
                // Skeleton loading state for messages
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[70%] ${index % 2 === 0 ? "bg-secondary" : "bg-primary text-primary-foreground"} rounded-lg p-3`}
                      >
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4 mt-1" />
                        <div className="flex justify-end mt-1">
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = user?.id === message.sender
                    const showDate =
                      index === 0 || formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                              {formatDate(message.created_at)}
                            </div>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary"} rounded-lg p-3`}
                          >
                            <p className="break-words">{message.content}</p>
                            <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mt-1`}>
                              <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start the conversation by sending a message</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message input */}
          <Card>
            <CardContent className="p-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Type a message..."
                            {...field}
                            disabled={isSending}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                form.handleSubmit(onSubmit)()
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="icon" disabled={isSending}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

