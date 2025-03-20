"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

const jobSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  skills_required: z.array(z.string()).min(1, { message: "At least one skill is required" }),
  budget: z.coerce.number().min(1, { message: "Budget must be at least 1" }),
  job_type: z.enum(["fixed", "hourly"], { required_error: "Please select a job type" }),
})

type Category = {
  id: number
  name: string
}

export default function NewJobPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([
    { id: 2, name: "Web Development" },
    { id: 3, name: "Graphic Design" },
    { id: 4, name: "Mobile Development" },
    { id: 5, name: "UI/UX Design" },
    { id: 6, name: "Content Writing" },
    { id: 7, name: "Digital Marketing" },
    { id: 8, name: "Programming and tech" },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [skillInput, setSkillInput] = useState("")

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      skills_required: [],
      budget: 0,
      job_type: "fixed",
    },
  })

  async function onSubmit(values: z.infer<typeof jobSchema>) {
    try {
      setIsLoading(true)
      await api.post("/api/jobs/", values)

      toast({
        title: "Job posted",
        description: "Your job has been posted successfully",
      })

      router.push("/client/jobs")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() === "") return

    const currentSkills = form.getValues().skills_required
    if (!currentSkills.includes(skillInput.trim())) {
      form.setValue("skills_required", [...currentSkills, skillInput.trim()])
    }

    setSkillInput("")
  }

  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues().skills_required
    form.setValue(
      "skills_required",
      currentSkills.filter((s) => s !== skill),
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={["client"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
            <p className="text-muted-foreground">Create a new job posting to find the perfect freelancer</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Provide detailed information about your job to attract qualified freelancers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Website Development for E-commerce Store" {...field} />
                        </FormControl>
                        <FormDescription>A clear and concise title that describes the job</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the job in detail, including requirements, deliverables, and timeline..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of the job, including specific requirements and expectations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Select the category that best fits your job</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills_required"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Skills</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value.map((skill) => (
                            <div
                              key={skill}
                              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm flex items-center gap-1"
                            >
                              {skill}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1"
                                onClick={() => removeSkill(skill)}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove {skill}</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a skill..."
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addSkill()
                              }
                            }}
                          />
                          <Button type="button" onClick={addSkill}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        <FormDescription>Add skills that are required for this job</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" step="0.01" {...field} />
                          </FormControl>
                          <FormDescription>Set your budget for this job</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="job_type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Job Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="fixed" />
                                </FormControl>
                                <FormLabel className="font-normal">Fixed Price</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="hourly" />
                                </FormControl>
                                <FormLabel className="font-normal">Hourly Rate</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.push("/client/jobs")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Posting..." : "Post Job"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

