"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar, DollarSign, Filter, Plus } from "lucide-react"

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

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "",
      ordering: "-created_at",
    },
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async (filters = {}) => {
    setIsLoading(true)
    try {
      // Build query params from filters
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string)
      })

      // Add client=true to only get the client's jobs
      params.append("client", "true")

      const response = await api.get(`/api/jobs/?${params.toString()}`)
      setJobs(response.data.results)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function onSubmit(values: z.infer<typeof filterSchema>) {
    fetchJobs(values)
  }

  const handleJobAction = async (jobId: number, action: string) => {
    try {
      setIsUpdating(jobId)
      await api.post(`/api/jobs/${jobId}/${action}/`)

      // Update the local state to reflect the status change
      setJobs(
        jobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status:
                  action === "mark_in_progress"
                    ? "in_progress"
                    : action === "mark_completed"
                      ? "completed"
                      : "cancelled",
              }
            : job,
        ),
      )

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
      setIsUpdating(null)
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

  return (
    <ProtectedRoute allowedUserTypes={["client"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
              <p className="text-muted-foreground">Manage your posted jobs and proposals</p>
            </div>
            <Link href="/client/jobs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </Link>
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
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
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
                            <SelectItem value="-budget">Highest Budget</SelectItem>
                            <SelectItem value="budget">Lowest Budget</SelectItem>
                            <SelectItem value="-total_proposals">Most Proposals</SelectItem>
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
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span>{job.category_name}</span>
                          <span className="mx-2">•</span>
                          <span>{job.job_type === "fixed" ? "Fixed Price" : "Hourly"}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace("_", " ")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Budget</div>
                          <div className="text-sm text-muted-foreground">${job.budget}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Posted</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="font-medium">Proposals</div>
                        <div className="text-sm text-muted-foreground ml-2">{job.total_proposals}</div>
                      </div>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex justify-between py-4">
                    <div className="flex gap-2">
                      <Link href={`/client/jobs/${job.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      <Link href={`/client/jobs/${job.id}/proposals`}>
                        <Button variant="outline">View Proposals</Button>
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      {job.status === "open" && (
                        <Button
                          variant="outline"
                          onClick={() => handleJobAction(job.id, "mark_in_progress")}
                          disabled={isUpdating === job.id}
                        >
                          {isUpdating === job.id ? "Updating..." : "Mark In Progress"}
                        </Button>
                      )}
                      {job.status === "in_progress" && (
                        <Button
                          variant="outline"
                          onClick={() => handleJobAction(job.id, "mark_completed")}
                          disabled={isUpdating === job.id}
                        >
                          {isUpdating === job.id ? "Updating..." : "Mark Completed"}
                        </Button>
                      )}
                      {(job.status === "open" || job.status === "in_progress") && (
                        <Button
                          variant="destructive"
                          onClick={() => handleJobAction(job.id, "cancel")}
                          disabled={isUpdating === job.id}
                        >
                          {isUpdating === job.id ? "Cancelling..." : "Cancel Job"}
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-lg font-medium">No jobs found</p>
                  <p className="text-sm text-muted-foreground mt-1">You haven't posted any jobs yet</p>
                  <Link href="/client/jobs/new" className="mt-4">
                    <Button>Post Your First Job</Button>
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

