"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Calendar, DollarSign, Globe, ArrowLeft, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

type Job = {
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

export default function ClientJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchJobDetails = async () => {
      setIsLoading(true)
      try {
        const response = await api.get(`/api/jobs/${jobId}/`)
        setJob(response.data)
      } catch (error) {
        console.error("Error fetching job details:", error)
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (jobId) {
      fetchJobDetails()
    }
  }, [jobId])

  const handleJobAction = async (action: string) => {
    try {
      setIsUpdating(true)
      await api.post(`/api/jobs/${jobId}/${action}/`)

      // Update the local state to reflect the status change
      if (job) {
        setJob({
          ...job,
          status:
            action === "mark_in_progress" ? "in_progress" : action === "mark_completed" ? "completed" : "cancelled",
        })
      }

      toast({
        title: "Job updated",
        description: `Job has been ${
          action === "mark_in_progress"
            ? "marked as in progress"
            : action === "mark_completed"
              ? "marked as completed"
              : "cancelled"
        }.`,
      })
    } catch (error) {
      console.error(`Error ${action} job:`, error)
      toast({
        title: "Error",
        description: `Failed to ${
          action === "mark_in_progress"
            ? "mark job as in progress"
            : action === "mark_completed"
              ? "mark job as completed"
              : "cancel job"
        }`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
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
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
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

  if (!job) {
    return (
      <ProtectedRoute allowedUserTypes={["client"]}>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center py-10">
            <h1 className="text-2xl font-bold">Job not found</h1>
            <p className="text-muted-foreground mt-2">The job you're looking for doesn't exist or has been removed.</p>
            <Button className="mt-4" onClick={() => router.push("/client/jobs")}>
              View All Jobs
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
            <h1 className="text-2xl font-bold">Job Details</h1>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{job.title}</h2>
              <div className="flex items-center mt-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace("_", " ")}
                </div>
                <span className="mx-2">•</span>
                <span className="text-sm text-muted-foreground">
                  Posted on {new Date(job.created_at).toLocaleDateString()}
                </span>
                <span className="mx-2">•</span>
                <span className="text-sm text-muted-foreground">{job.total_proposals} proposals</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/client/jobs/${job.id}/proposals`}>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Proposals
                </Button>
              </Link>
              <Link href={`/client/jobs/${job.id}/edit`}>
                <Button variant="outline">Edit Job</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{job.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill) => (
                      <div key={skill} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm">
                        {skill}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.status === "open" && (
                      <Button onClick={() => handleJobAction("mark_in_progress")} disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Mark In Progress"}
                      </Button>
                    )}
                    {job.status === "in_progress" && (
                      <Button onClick={() => handleJobAction("mark_completed")} disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Mark Completed"}
                      </Button>
                    )}
                    {(job.status === "open" || job.status === "in_progress") && (
                      <Button variant="destructive" onClick={() => handleJobAction("cancel")} disabled={isUpdating}>
                        {isUpdating ? "Cancelling..." : "Cancel Job"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Budget</div>
                      <div className="text-sm text-muted-foreground">${job.budget}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Job Type</div>
                      <div className="text-sm text-muted-foreground">
                        {job.job_type === "fixed" ? "Fixed Price" : "Hourly"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Category</div>
                      <div className="text-sm text-muted-foreground">{job.category_name}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proposals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You have received {job.total_proposals} proposals for this job.
                  </p>
                </CardContent>
                <Separator />
                <CardFooter className="pt-4">
                  <Link href={`/client/jobs/${job.id}/proposals`} className="w-full">
                    <Button className="w-full">View All Proposals</Button>
                  </Link>
                </CardFooter>
              </Card>

              {job.status === "completed" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This job is marked as completed. You can now make a payment to the freelancer.
                    </p>
                  </CardContent>
                  <Separator />
                  <CardFooter className="pt-4">
                    <Link href={`/client/jobs/${job.id}/payment`} className="w-full">
                      <Button className="w-full">Make Payment</Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

