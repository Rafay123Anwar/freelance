"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowUpFromLine, BanknoteIcon as Bank, DollarSign, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

const withdrawalSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "Amount must be a number" })
    .refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" }),
  bank_account_id: z.string({
    required_error: "Please select a bank account",
  }),
})

type BankAccount = {
  id: number
  user: number
  account_holder_name: string
  account_number: string
  routing_number: string
  bank_name: string
  is_default: boolean
  created_at: string
}

export default function WithdrawPage() {
  const router = useRouter()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(true)
  const [walletBalance, setWalletBalance] = useState("0.00")

  const form = useForm<z.infer<typeof withdrawalSchema>>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      bank_account_id: "",
    },
  })

  useEffect(() => {
    fetchBankAccounts()
    fetchWalletBalance()
  }, [])

  const fetchBankAccounts = async () => {
    try {
      setIsFetchingAccounts(true)
      const response = await api.get("/api/payments/bank-accounts/")
      setBankAccounts(response.data)

      // Set default bank account if available
      const defaultAccount = response.data.find((account: BankAccount) => account.is_default)
      if (defaultAccount) {
        form.setValue("bank_account_id", defaultAccount.id.toString())
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error)
      toast({
        title: "Error",
        description: "Failed to load bank accounts",
        variant: "destructive",
      })
    } finally {
      setIsFetchingAccounts(false)
    }
  }

  const fetchWalletBalance = async () => {
    try {
      const response = await api.get("/api/auth/freelancer/stats/")
      setWalletBalance(response.data.wallet_balance)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
    }
  }

  async function onSubmit(values: z.infer<typeof withdrawalSchema>) {
    try {
      setIsLoading(true)

      // Format the data according to the API requirements
      const withdrawalData = {
        amount: Number.parseFloat(values.amount),
        bank_account_id: Number.parseInt(values.bank_account_id),
      }

      await api.post("/api/payments/withdrawal/", withdrawalData)

      toast({
        title: "Withdrawal initiated",
        description: "Your withdrawal has been initiated successfully.",
      })

      router.push("/payments")
    } catch (error: any) {
      console.error("Error initiating withdrawal:", error)
      toast({
        title: "Failed to initiate withdrawal",
        description: error.response?.data?.detail || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedUserTypes={["freelancer"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
            <p className="text-muted-foreground">Withdraw funds from your wallet to your bank account</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Amount</CardTitle>
                <CardDescription>Enter the amount you want to withdraw</CardDescription>
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
                          <FormDescription>Available balance: ${walletBalance}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bank_account_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Account</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a bank account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bankAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.bank_name} - {account.account_number}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select the bank account to withdraw funds to</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={isLoading || isFetchingAccounts}>
                        {isLoading ? "Processing..." : "Withdraw Funds"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/freelancer/payments/bank-accounts/new")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bank Account
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Information</CardTitle>
                <CardDescription>How withdrawals work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <ArrowUpFromLine className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Processing Time</h3>
                    <p className="text-sm text-muted-foreground">
                      Withdrawals typically take 3-5 business days to process and appear in your bank account.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <Bank className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Bank Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                      You can add multiple bank accounts and select which one to use for each withdrawal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Fees</h3>
                    <p className="text-sm text-muted-foreground">
                      A small processing fee may apply to withdrawals. The fee will be displayed before you confirm the
                      withdrawal.
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

