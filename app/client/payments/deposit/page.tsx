"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CreditCard, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

const depositSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "Amount must be a number" })
    .refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" })
    .refine((val) => Number(val) <= 10000, { message: "Amount must be less than or equal to $10,000" }),
})

export default function DepositPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
    },
  })

  async function onSubmit(values: z.infer<typeof depositSchema>) {
    try {
      setIsLoading(true)

      // Format the data according to the API requirements
      const depositData = {
        amount: Number.parseFloat(values.amount),
      }

      const response = await api.post("/api/payments/deposit/", depositData)

      toast({
        title: "Deposit initiated",
        description: "Your deposit has been initiated successfully.",
      })

      // In a real app, you would handle the Stripe payment flow here
      // using the client_secret from the response

      // For now, just redirect to the payments page
      router.push("/payments")
    } catch (error: any) {
      console.error("Error initiating deposit:", error)
      toast({
        title: "Failed to initiate deposit",
        description: error.response?.data?.detail || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedUserTypes={["client"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
            <p className="text-muted-foreground">Add funds to your wallet to pay freelancers</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Amount</CardTitle>
                <CardDescription>Enter the amount you want to deposit</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input type="number" placeholder="100.00" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>Enter the amount you want to deposit (maximum $10,000)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Processing..." : "Deposit Funds"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>How deposits work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Secure Payments</h3>
                    <p className="text-sm text-muted-foreground">
                      All payments are processed securely through Stripe. Your card information is never stored on our
                      servers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Wallet Balance</h3>
                    <p className="text-sm text-muted-foreground">
                      Deposited funds will be added to your wallet balance. You can use these funds to pay freelancers
                      for their work.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/payments")}>
                  View Transaction History
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

