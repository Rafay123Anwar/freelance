"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar, DollarSign, Filter, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

const filterSchema = z.object({
  payment_type: z.string().optional(),
  status: z.string().optional(),
  ordering: z.string().optional(),
})

type Payment = {
  id: number
  sender: number
  sender_details: {
    id: number
    email: string
    first_name: string
    last_name: string
    user_type: string
    is_email_verified: boolean
  }
  recipient: number
  recipient_details: {
    id: number
    email: string
    first_name: string
    last_name: string
    user_type: string
    is_email_verified: boolean
  }
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
  amount: string
  payment_type: string
  status: string
  stripe_payment_id: string | null
  created_at: string
  updated_at: string
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      payment_type: "all",
      status: "all",
      ordering: "-created_at",
    },
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async (filters = {}) => {
    setIsLoading(true)
    try {
      // Build query params from filters
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value as string)
      })

      const response = await api.get(`/api/payments/?${params.toString()}`)
      setPayments(response.data)
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function onSubmit(values: z.infer<typeof filterSchema>) {
    fetchPayments(values)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatPaymentType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
              <p className="text-muted-foreground">Manage your payments and transactions</p>
            </div>
            <div className="flex gap-2">
              {user?.user_type === "client" && (
                <Link href="/client/payments/deposit">
                  <Button>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Deposit Funds
                  </Button>
                </Link>
              )}
              {user?.user_type === "freelancer" && (
                <Link href="/freelancer/payments/withdraw">
                  <Button>
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Withdraw Funds
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filters</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="payment_type"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Payment Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="deposit">Deposit</SelectItem>
                            <SelectItem value="withdrawal">Withdrawal</SelectItem>
                            <SelectItem value="job_payment">Job Payment</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ordering"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="-created_at">Newest First</SelectItem>
                            <SelectItem value="created_at">Oldest First</SelectItem>
                            <SelectItem value="-amount">Highest Amount</SelectItem>
                            <SelectItem value="amount">Lowest Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Apply Filters</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : payments.length > 0 ? (
              payments.map((payment) => (
                <Card key={payment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{formatPaymentType(payment.payment_type)}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          {payment.job_details ? (
                            <span>Job: {payment.job_details.title}</span>
                          ) : (
                            <span>{payment.payment_type === "deposit" ? "Wallet Deposit" : "Wallet Withdrawal"}</span>
                          )}
                          <span className="mx-2">•</span>
                          <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Amount</div>
                          <div className="text-sm text-muted-foreground">${payment.amount}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Date</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="font-medium">{user?.user_type === "client" ? "Recipient" : "Sender"}</div>
                        <div className="text-sm text-muted-foreground ml-2">
                          {user?.user_type === "client"
                            ? `${payment.recipient_details?.first_name} ${payment.recipient_details?.last_name}`
                            : `${payment.sender_details?.first_name} ${payment.sender_details?.last_name}`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex justify-between py-4">
                    {payment.job && (
                      <Link href={`/jobs/${payment.job}`}>
                        <Button variant="outline">View Job</Button>
                      </Link>
                    )}
                    <Link href={`/payments/${payment.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-lg font-medium">No payments found</p>
                  <p className="text-sm text-muted-foreground mt-1">You haven't made or received any payments yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

