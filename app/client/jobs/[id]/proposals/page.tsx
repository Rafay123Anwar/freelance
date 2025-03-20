"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, DollarSign, MessageSquare } from "lucide-react"

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

export default function JobProposalsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null)
  const [jobTitle, setJobTitle] = useState("")

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true)
      try {
        const response = await api.get(`/api/proposals/job/${jobId}/`)
        // setProposals(response.data)
        setProposals(response.data.results);

        // Set job title if we have proposals
        if (response.data.length > 0) {
          setJobTitle(response.data[0].job_details.title)
        } else {
          // If no proposals, fetch job details to get the title
          const jobResponse = await api.get(`/api/jobs/${jobId}/`)
          setJobTitle(jobResponse.data.title)
        }
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

    if (jobId) {
      fetchProposals()
    }
  }, [jobId])

  const handleAcceptProposal = async (proposalId: number) => {
    try {
      setIsActionLoading(proposalId)
      const response = await api.post(`/api/proposals/${proposalId}/accept/`)

      // Update the local state to reflect the acceptance
      setProposals(
        proposals.map((proposal) => (proposal.id === proposalId ? { ...proposal, status: "accepted" } : proposal)),
      )

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
      setIsActionLoading(null)
    }
  }

  const handleRejectProposal = async (proposalId: number) => {
    try {
      setIsActionLoading(proposalId)
      await api.post(`/api/proposals/${proposalId}/reject/`)

      // Update the local state to reflect the rejection
      setProposals(
        proposals.map((proposal) => (proposal.id === proposalId ? { ...proposal, status: "rejected" } : proposal)),
      )

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
      setIsActionLoading(null)
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
    <ProtectedRoute allowedUserTypes={["client"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Proposals</h1>
              <p className="text-muted-foreground">{jobTitle ? `For: ${jobTitle}` : "Loading..."}</p>
            </div>
          </div>

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
                        <CardTitle className="text-xl">
                          {proposal.freelancer_details.first_name} {proposal.freelancer_details.last_name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span>Submitted on {new Date(proposal.created_at).toLocaleDateString()}</span>
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
                    </div>
                    <div className="mt-4">
                      <div className="font-medium">Cover Letter Preview:</div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proposal.cover_letter}</p>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex justify-between py-4">
                    <div className="flex gap-2">
                      <Link href={`/client/proposals/${proposal.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      {proposal.status === "accepted" && (
                        <Link href={`/messages/rooms/${proposal.job}`}>
                          <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </Link>
                      )}
                    </div>
                    {proposal.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleAcceptProposal(proposal.id)}
                          disabled={isActionLoading === proposal.id}
                        >
                          {isActionLoading === proposal.id ? "Processing..." : "Accept"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectProposal(proposal.id)}
                          disabled={isActionLoading === proposal.id}
                        >
                          {isActionLoading === proposal.id ? "Processing..." : "Reject"}
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-lg font-medium">No proposals found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You haven't received any proposals for this job yet
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

