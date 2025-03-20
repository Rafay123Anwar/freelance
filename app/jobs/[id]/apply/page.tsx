"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

const proposalSchema = z.object({
  cover_letter: z
    .string()
    .min(100, { message: "Cover letter must be at least 100 characters" })
    .max(5000, { message: "Cover letter must be less than 5000 characters" }),
  bid_amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "Bid amount must be a number" })
    .refine((val) => Number(val) > 0, { message: "Bid amount must be greater than 0" }),
  estimated_time: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "Estimated time must be a number" })
    .refine((val) => Number(val) > 0, { message: "Estimated time must be greater than 0" }),
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

export default function JobApplyPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const jobId = params.id
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof proposalSchema>>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      cover_letter: "",
      bid_amount: "",
      estimated_time: "",
    },
  })

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

  async function onSubmit(values: z.infer<typeof proposalSchema>) {
    if (user?.user_type !== "freelancer") {
      toast({
        title: "Error",
        description: "Only freelancers can submit proposals",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Format the data according to the API requirements
      const proposalData = {
        job : jobId,
        cover_letter: values.cover_letter,
        bid_amount: Number.parseFloat(values.bid_amount),
        estimated_time: Number.parseInt(values.estimated_time),
      }

      console.log("Submitting proposal data:", proposalData)

      await api.post(`/api/proposals/job/${jobId}/`, proposalData)

      toast({
        title: "Proposal submitted",
        description: "Your proposal has been submitted successfully.",
      })

      router.push("/freelancer/proposals")
    } catch (error: any) {
      console.error("Error submitting proposal:", error)
      toast({
        title: "Failed to submit proposal",
        description: error.response?.data?.detail || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={["freelancer"]}>
        <DashboardLayout>
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <Skeleton className="h-32 w-full" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
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
      <ProtectedRoute allowedUserTypes={["freelancer"]}>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center py-10">
            <h1 className="text-2xl font-bold">Job not found</h1>
            <p className="text-muted-foreground mt-2">The job you're looking for doesn't exist or has been removed.</p>
            <Button className="mt-4" onClick={() => router.push("/jobs")}>
              Browse Jobs
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={["freelancer"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Submit a Proposal</h1>
            <p className="text-muted-foreground">
              Apply for "{job.title}" posted by {job.client.first_name} {job.client.last_name}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Proposal</CardTitle>
                  <CardDescription>Provide details about your proposal for this job</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="cover_letter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Letter</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Introduce yourself and explain why you're a good fit for this job..."
                                className="min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Explain your experience, approach, and why you're the right person for this job.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bid_amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bid Amount ($)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="1000" {...field} />
                              </FormControl>
                              <FormDescription>Your total bid for this project</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="estimated_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Days</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="14" {...field} />
                              </FormControl>
                              <FormDescription>How long will it take to complete</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Proposal"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Job Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium">Title</div>
                    <div className="text-sm text-muted-foreground">{job.title}</div>
                  </div>
                  <div>
                    <div className="font-medium">Client</div>
                    <div className="text-sm text-muted-foreground">
                      {job.client.first_name} {job.client.last_name}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Budget</div>
                    <div className="text-sm text-muted-foreground">${job.budget}</div>
                  </div>
                  <div>
                    <div className="font-medium">Category</div>
                    <div className="text-sm text-muted-foreground">{job.category_name}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.back()}>
                    Back to Job Details
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

