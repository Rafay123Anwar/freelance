"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

const profileSchema = z.object({
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }),
  skills: z.array(z.string()).min(1, { message: "At least one skill is required" }),
  experience_years: z.coerce.number().min(0, { message: "Experience years must be a positive number" }),
  hourly_rate: z.coerce.number().min(1, { message: "Hourly rate must be at least 1" }),
})

const portfolioSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  url: z.string().url({ message: "Please enter a valid URL" }),
})

type FreelancerProfile = {
  id: number
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    user_type: string
    is_email_verified: boolean
  }
  profile_picture: string | null
  bio: string
  skills: string[]
  experience_years: number
  hourly_rate: string
  wallet_balance: string
  portfolio_items: PortfolioItem[]
  total_jobs_applied: number
  total_proposals_sent: number
  total_earnings: string
  average_rating: number
}

type PortfolioItem = {
  id: number
  title: string
  description: string
  image: string | null
  url: string
  created_at: string
}

export default function FreelancerProfilePage() {
  const [profile, setProfile] = useState<FreelancerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [skillInput, setSkillInput] = useState("")

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: "",
      skills: [],
      experience_years: 0,
      hourly_rate: 0,
    },
  })

  const portfolioForm = useForm<z.infer<typeof portfolioSchema>>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/auth/freelancer/profile/")
        setProfile(response.data)
        form.reset({
          bio: response.data.bio || "",
          skills: response.data.skills || [],
          experience_years: response.data.experience_years || 0,
          hourly_rate: Number.parseFloat(response.data.hourly_rate) || 0,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [form])

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      setIsSaving(true)
      const response = await api.put("/api/auth/freelancer/profile/", values)
      setProfile(response.data)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function onPortfolioSubmit(values: z.infer<typeof portfolioSchema>) {
    try {
      setIsSaving(true)
      const response = await api.post("/api/auth/portfolio/", values)

      // Update the profile with the new portfolio item
      if (profile) {
        setProfile({
          ...profile,
          portfolio_items: [...profile.portfolio_items, response.data],
        })
      }

      portfolioForm.reset()

      toast({
        title: "Portfolio item added",
        description: "Your portfolio item has been added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add portfolio item",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function deletePortfolioItem(id: number) {
    try {
      await api.delete(`/api/auth/portfolio/${id}/`)

      // Update the profile by removing the deleted portfolio item
      if (profile) {
        setProfile({
          ...profile,
          portfolio_items: profile.portfolio_items.filter((item) => item.id !== id),
        })
      }

      toast({
        title: "Portfolio item deleted",
        description: "Your portfolio item has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete portfolio item",
        variant: "destructive",
      })
    }
  }

  const addSkill = () => {
    if (skillInput.trim() === "") return

    const currentSkills = form.getValues().skills
    if (!currentSkills.includes(skillInput.trim())) {
      form.setValue("skills", [...currentSkills, skillInput.trim()])
    }

    setSkillInput("")
  }

  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues().skills
    form.setValue(
      "skills",
      currentSkills.filter((s) => s !== skill),
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={["freelancer"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your profile information and portfolio</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a profile picture to make your profile more personalized</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                        {profile?.profile_picture ? (
                          <img
                            src={profile.profile_picture || "/placeholder.svg"}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-semibold text-muted-foreground">
                            {profile?.user.first_name.charAt(0)}
                            {profile?.user.last_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Upload profile picture</span>
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {profile?.user.first_name} {profile?.user.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{profile?.user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Update your professional details to attract more clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell clients about yourself, your experience, and expertise..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>This will be displayed on your profile</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
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
                                    <Trash className="h-3 w-3" />
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
                                Add
                              </Button>
                            </div>
                            <FormDescription>Add skills that showcase your expertise</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="experience_years"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Experience</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="hourly_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly Rate ($)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="portfolio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Portfolio Item</CardTitle>
                  <CardDescription>Showcase your work to potential clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...portfolioForm}>
                    <form onSubmit={portfolioForm.handleSubmit(onPortfolioSubmit)} className="space-y-4">
                      <FormField
                        control={portfolioForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Portfolio item title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={portfolioForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your work, technologies used, and your role..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={portfolioForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/your-project" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Adding..." : "Add Portfolio Item"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Portfolio</CardTitle>
                  <CardDescription>Manage your portfolio items</CardDescription>
                </CardHeader>
                <CardContent>
                  {profile?.portfolio_items && profile.portfolio_items.length > 0 ? (
                    <div className="space-y-4">
                      {profile.portfolio_items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{item.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary mt-2 inline-block"
                              >
                                View Project
                              </a>
                            </div>
                            <Button variant="outline" size="icon" onClick={() => deletePortfolioItem(item.id)}>
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete portfolio item</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No portfolio items yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add your first portfolio item to showcase your work
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>View your account details and statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Account Type</h3>
                    <p className="text-sm text-muted-foreground">Freelancer</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">{profile?.user.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Wallet Balance</h3>
                    <p className="text-sm text-muted-foreground">${profile?.wallet_balance}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-medium">Account Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Jobs Applied</p>
                        <p className="text-lg font-medium">{profile?.total_jobs_applied}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Proposals Sent</p>
                        <p className="text-lg font-medium">{profile?.total_proposals_sent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <p className="text-lg font-medium">${profile?.total_earnings}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Rating</p>
                        <p className="text-lg font-medium">{profile?.average_rating} / 5</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <a href="/change-password">Change Password</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/freelancer/payments/withdraw">Withdraw Funds</a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

