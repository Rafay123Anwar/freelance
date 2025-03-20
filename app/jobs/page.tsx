"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  min_budget: z.string().optional(),
  max_budget: z.string().optional(),
  job_type: z.string().optional(),
  status: z.string().optional(),
  skills: z.string().optional(),
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

type Category = {
  id: number
  name: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalJobs, setTotalJobs] = useState(0)
  const [nextPage, setNextPage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      min_budget: searchParams.get("min_budget") || "",
      max_budget: searchParams.get("max_budget") || "",
      job_type: searchParams.get("job_type") || "",
      status: searchParams.get("status") || "open",
      skills: searchParams.get("skills") || "",
      ordering: searchParams.get("ordering") || "-created_at",
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/jobs/categories/")
        setCategories(response.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load job categories",
          variant: "destructive",
        })
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        // Build query params from form values
        const params = new URLSearchParams()
        const values = form.getValues()

        if (values.search) params.append("search", values.search)
        if (values.category) params.append("category", values.category)
        if (values.min_budget) params.append("min_budget", values.min_budget)
        if (values.max_budget) params.append("max_budget", values.max_budget)
        if (values.job_type) params.append("job_type", values.job_type)
        if (values.status) params.append("status", values.status)
        if (values.skills) params.append("skills", values.skills)
        if (values.ordering) params.append("ordering", values.ordering)

        const response = await api.get(`/api/jobs/?${params.toString()}`)
        setJobs(response.data.results)
        setTotalJobs(response.data.count)
        setNextPage(response.data.next)
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

    fetchJobs()
  }, [form])

  function onSubmit(values: z.infer<typeof searchSchema>) {
    // Update URL with search params
    const params = new URLSearchParams()

    if (values.search) params.append("search", values.search)
    if (values.category) params.append("category", values.category)
    if (values.min_budget) params.append("min_budget", values.min_budget)
    if (values.max_budget) params.append("max_budget", values.max_budget)
    if (values.job_type) params.append("job_type", values.job_type)
    if (values.status) params.append("status", values.status)
    if (values.skills) params.append("skills", values.skills)
    if (values.ordering) params.append("ordering", values.ordering)

    router.push(`/jobs?${params.toString()}`)

    // Fetch jobs with new filters
    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        const response = await api.get(`/api/jobs/?${params.toString()}`)
        setJobs(response.data.results)
        setTotalJobs(response.data.count)
        setNextPage(response.data.next)
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

    fetchJobs()
  }

  const loadMoreJobs = async () => {
    if (!nextPage) return

    try {
      const response = await api.get(nextPage)
      setJobs([...jobs, ...response.data.results])
      setNextPage(response.data.next)
    } catch (error) {
      console.error("Error fetching more jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load more jobs",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Find Jobs</h1>
            <p className="text-muted-foreground">Browse available jobs and submit proposals</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="search"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Search jobs..." className="pl-8" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="min_budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Min Budget" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="max_budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Max Budget" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="job_type"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Job Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="fixed">Fixed Price</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Skills (comma separated)" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ordering"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sort By" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="-created_at">Newest First</SelectItem>
                              <SelectItem value="created_at">Oldest First</SelectItem>
                              <SelectItem value="-budget">Highest Budget</SelectItem>
                              <SelectItem value="budget">Lowest Budget</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Apply Filters
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="md:col-span-3 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing {jobs.length} of {totalJobs} jobs
                </p>
              </div>

              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-16 rounded-md" />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : jobs.length > 0 ? (
                <>
                  {jobs.map((job) => (
                    <Card key={job.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <div className="text-sm font-medium">${job.budget}</div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>
                            {job.client.first_name} {job.client.last_name}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{job.category_name}</span>
                          <span className="mx-2">•</span>
                          <span>{job.job_type === "fixed" ? "Fixed Price" : "Hourly"}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills_required.map((skill) => (
                            <div
                              key={skill}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-muted-foreground">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground">{job.total_proposals} proposals</div>
                        </div>
                      </CardContent>
                      <Separator />
                      <CardFooter className="flex justify-between py-4">
                        <Link href={`/jobs/${job.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        <Link href={`/jobs/${job.id}/apply`}>
                          <Button>Apply Now</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}

                  {nextPage && (
                    <div className="flex justify-center mt-4">
                      <Button variant="outline" onClick={loadMoreJobs}>
                        Load More Jobs
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-lg font-medium">No jobs found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters to find more jobs</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

