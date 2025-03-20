"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Calendar, DollarSign, ArrowLeft, MessageSquare, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

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

export default function ClientProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const proposalId = params.id
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    const fetchProposal = async () => {
      setIsLoading(true)
      try {
        const response = await api.get(`/api/proposals/${proposalId}/`)
        setProposal(response.data)
      } catch (error) {
        console.error("Error fetching proposal:", error)
        toast({
          title: "Error",
          description: "Failed to load proposal details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (proposalId) {
      fetchProposal()
    }
  }, [proposalId])

  const handleAcceptProposal = async () => {
    try {
      setIsActionLoading(true)
      const response = await api.post(`/api/proposals/${proposalId}/accept/`)

      // Update the local state to reflect the acceptance
      if (proposal) {
        setProposal({
          ...proposal,
          status: "accepted",
        })
      }

      toast({
        title: "Proposal accepted",
        description: "The proposal has been accepted successfully.",
      })

      // If a chat room was created, we could redirect to it
      if (response.data.chat_room_id) {
        // router.push(`/messages/rooms/${response.data.chat_room_id}`)
      }
    } catch (error) {
      console.error("Error accepting proposal:", error)
      toast({
        title: "Error",
        description: "Failed to accept proposal",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleRejectProposal = async () => {
    try {
      setIsActionLoading(true)
      await api.post(`/api/proposals/${proposalId}/reject/`)

      // Update the local state to reflect the rejection
      if (proposal) {
        setProposal({
          ...proposal,
          status: "rejected",
        })
      }

      toast({
        title: "Proposal rejected",
        description: "The proposal has been rejected successfully.",
      })
    } catch (error) {
      console.error("Error rejecting proposal:", error)
      toast({
        title: "Error",
        description: "Failed to reject proposal",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
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

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={["client"]}>
        <DashboardLayout>
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!proposal) {
    return (
      <ProtectedRoute allowedUserTypes={["client"]}>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center py-10">
            <h1 className="text-2xl font-bold">Proposal not found</h1>
            <p className="text-muted-foreground mt-2">
              The proposal you're looking for doesn't exist or has been removed.
            </p>
            <Button className="mt-4" onClick={() => router.push("/client/proposals")}>
              View All Proposals
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={["client"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Proposal Details</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{proposal.cover_letter}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{proposal.job_details.title}</CardTitle>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(proposal.status)}`}
                    >
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span>Category: {proposal.job_details.category_name}</span>
                    <span className="mx-2">•</span>
                    <span>Received on {new Date(proposal.created_at).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-medium">Job Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {proposal.job_details.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium">Required Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proposal.job_details.skills_required.map((skill) => (
                        <div
                          key={skill}
                          className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/client/jobs/${proposal.job}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Job Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Freelancer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">
                        {proposal.freelancer_details.first_name} {proposal.freelancer_details.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{proposal.freelancer_details.email}</div>
                    </div>
                  </div>
                  <Link href={`/freelancer/${proposal.freelancer}/profile`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Freelancer Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proposal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Bid Amount</div>
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
                      <div className="font-medium">Your Budget</div>
                      <div className="text-sm text-muted-foreground">${proposal.job_details.budget}</div>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex flex-col gap-3 py-4">
                  {proposal.status === "pending" ? (
                    <>
                      <Button className="w-full" onClick={handleAcceptProposal} disabled={isActionLoading}>
                        {isActionLoading ? "Processing..." : "Accept Proposal"}
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleRejectProposal}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? "Processing..." : "Reject Proposal"}
                      </Button>
                    </>
                  ) : proposal.status === "accepted" ? (
                    <Link href={`/messages/rooms/${proposal.job}`} className="w-full">
                      <Button className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Freelancer
                      </Button>
                    </Link>
                  ) : null}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

