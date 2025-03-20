"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

// Update the verify email form to use token instead of code
const verifyEmailSchema = z.object({
  token: z.string().min(6, { message: "Verification token must be at least 6 characters" }),
})

export default function VerifyEmailPage() {
  const { verifyEmail, isLoading } = useAuth()
  const [resendLoading, setResendLoading] = useState(false)

  const form = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token: "",
    },
  })

  async function onSubmit(values: z.infer<typeof verifyEmailSchema>) {
    await verifyEmail(values.token)
  }

  // Update the resend verification endpoint to match the API
  async function handleResendCode() {
    try {
      setResendLoading(true)
      // Get the email from localStorage if available
      const savedUser = localStorage.getItem("user")
      let email = ""

      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          email = user.email
        } catch (error) {
          console.error("Error parsing saved user", error)
        }
      }

      if (!email) {
        toast({
          title: "Error",
          description: "Please login again to resend verification code",
          variant: "destructive",
        })
        return
      }

      await api.post("/api/auth/resend-verification/", { email })

      toast({
        title: "Verification code sent",
        description: "A new verification code has been sent to your email.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to resend code",
        description: error.response?.data?.detail || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="text-sm text-muted-foreground">Enter the verification token sent to your email</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Email Verification</CardTitle>
            <CardDescription>We've sent a verification token to your email address</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Token</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter token" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center">
              Didn&apos;t receive a token?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={handleResendCode} disabled={resendLoading}>
                {resendLoading ? "Sending..." : "Resend token"}
              </Button>
            </div>
            <div className="text-sm text-center">
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

