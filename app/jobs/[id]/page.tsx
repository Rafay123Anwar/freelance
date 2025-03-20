"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Calendar, DollarSign, Globe, User } from "lucide-react"

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

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
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

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 mr-2 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
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
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center py-10">
            <h1 className="text-2xl font-bold">Job not found</h1>
            <p className="text-muted-foreground mt-2">The job you're looking for doesn't exist or has been removed.</p>
            <Link href="/jobs" className="mt-4">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              {/* <Link href={`/jobs/${jobId}/apply`}>
                <Button>Apply Now</Button>
              </Link> */}
              {job.status === "open" && (
                <Link href={`/jobs/${job.id}/apply`}>
                  <Button>Apply Now</Button>
                </Link>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{job.total_proposals} proposals</span>
              <span className="mx-2">•</span>
              <span>Status: {job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {job.description.split("\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
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
                      <div className="font-medium">Posted Date</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About the Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {job.client.first_name} {job.client.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">Client</div>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/client/${job.client.id}/profile`}>View Client Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

