"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar, DollarSign, Filter } from "lucide-react"

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

const filterSchema = z.object({
  status: z.string().optional(),
  ordering: z.string().optional(),
})

type Proposal = {
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
  freelancer: number
  freelancer_details: {
    id: number
    email: string
    first_name: string
    last_name: string
    user_type: string
    is_email_verified: boolean
  }
  cover_letter: string
  bid_amount: string
  estimated_time: number
  status: string
  created_at: string
  updated_at: string
}

export default function FreelancerProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWithdrawing, setIsWithdrawing] = useState<number | null>(null)

  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "all",
      ordering: "-created_at",
    },
  })

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async (filters = {}) => {
    setIsLoading(true)
    try {
      // Build query params from filters
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value as string)
      })

      const response = await api.get(`/api/proposals/my/?${params.toString()}`)
      console.log("API Response:", response.data) // Debugging
      setProposals(response.data.results) // Make sure you're using `results`
      // setProposals(response.data)
    } catch (error) {
      console.error("Error fetching proposals:", error)
      toast({
        title: "Error",
        description: "Failed to load proposals",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function onSubmit(values: z.infer<typeof filterSchema>) {
    fetchProposals(values)
  }

  const handleWithdrawProposal = async (proposalId: number) => {
    try {
      setIsWithdrawing(proposalId)
      await api.post(`/api/proposals/${proposalId}/withdraw/`)

      // Update the local state to reflect the withdrawal
      setProposals(
        proposals.map((proposal) => (proposal.id === proposalId ? { ...proposal, status: "withdrawn" } : proposal)),
      )

      toast({
        title: "Proposal withdrawn",
        description: "Your proposal has been successfully withdrawn.",
      })
    } catch (error) {
      console.error("Error withdrawing proposal:", error)
      toast({
        title: "Error",
        description: "Failed to withdraw proposal",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(null)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "withdrawn":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ProtectedRoute allowedUserTypes={["freelancer"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">My Proposals</h1>
            <p className="text-muted-foreground">Track and manage your job proposals</p>
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
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
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
                            <SelectItem value="-bid_amount">Highest Bid</SelectItem>
                            <SelectItem value="bid_amount">Lowest Bid</SelectItem>
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
            ) : proposals.length > 0 ? (
              proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{proposal.job_details.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span>
                            Client: {proposal.job_details.client.first_name} {proposal.job_details.client.last_name}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{proposal.job_details.category_name}</span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(proposal.status)}`}
                      >
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Your Bid</div>
                          <div className="text-sm text-muted-foreground">${proposal.bid_amount}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Estimated Time</div>
                          <div className="text-sm text-muted-foreground">{proposal.estimated_time} days</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Submitted</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex justify-between py-4">
                    <Link href={`/jobs/${proposal.job}`}>
                      <Button variant="outline">View Job</Button>
                    </Link>
                    <div className="flex gap-2">
                      <Link href={`/freelancer/proposals/${proposal.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      {proposal.status === "pending" && (
                        <Button
                          variant="destructive"
                          onClick={() => handleWithdrawProposal(proposal.id)}
                          disabled={isWithdrawing === proposal.id}
                        >
                          {isWithdrawing === proposal.id ? "Withdrawing..." : "Withdraw"}
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-lg font-medium">No proposals found</p>
                  <p className="text-sm text-muted-foreground mt-1">You haven't submitted any proposals yet</p>
                  <Link href="/jobs" className="mt-4">
                    <Button>Browse Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

