"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BanknoteIcon as Bank, Check, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

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

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSettingDefault, setIsSettingDefault] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/payments/bank-accounts/")
      setBankAccounts(response.data)
    } catch (error) {
      console.error("Error fetching bank accounts:", error)
      toast({
        title: "Error",
        description: "Failed to load bank accounts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (accountId: number) => {
    try {
      setIsSettingDefault(accountId)
      await api.post(`/api/payments/bank-accounts/${accountId}/set_default/`)

      // Update the local state to reflect the change
      setBankAccounts(
        bankAccounts.map((account) => ({
          ...account,
          is_default: account.id === accountId,
        })),
      )

      toast({
        title: "Default account set",
        description: "Your default bank account has been updated.",
      })
    } catch (error) {
      console.error("Error setting default bank account:", error)
      toast({
        title: "Error",
        description: "Failed to set default bank account",
        variant: "destructive",
      })
    } finally {
      setIsSettingDefault(null)
    }
  }

  const handleDelete = async (accountId: number) => {
    try {
      setIsDeleting(accountId)
      await api.delete(`/api/payments/bank-accounts/${accountId}/`)

      // Update the local state to remove the deleted account
      setBankAccounts(bankAccounts.filter((account) => account.id !== accountId))

      toast({
        title: "Bank account deleted",
        description: "Your bank account has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting bank account:", error)
      toast({
        title: "Error",
        description: "Failed to delete bank account",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <ProtectedRoute allowedUserTypes={["freelancer"]}>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
              <p className="text-muted-foreground">Manage your bank accounts for withdrawals</p>
            </div>
            <Link href="/freelancer/payments/bank-accounts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Bank Account
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: 2 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : bankAccounts.length > 0 ? (
              bankAccounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{account.bank_name}</CardTitle>
                        <CardDescription>
                          {account.is_default && <span className="text-primary">Default Account</span>}
                        </CardDescription>
                      </div>
                      <Bank className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Account Holder:</span> {account.account_holder_name}
                      </div>
                      <div>
                        <span className="font-medium">Account Number:</span> {account.account_number}
                      </div>
                      <div>
                        <span className="font-medium">Routing Number:</span> {account.routing_number}
                      </div>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex justify-between py-4">
                    {!account.is_default && (
                      <Button
                        variant="outline"
                        onClick={() => handleSetDefault(account.id)}
                        disabled={isSettingDefault === account.id}
                      >
                        {isSettingDefault === account.id ? (
                          "Setting Default..."
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Set as Default
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(account.id)}
                      disabled={isDeleting === account.id || account.is_default}
                    >
                      {isDeleting === account.id ? (
                        "Deleting..."
                      ) : (
                        <>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Bank className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No bank accounts found</p>
                  <p className="text-sm text-muted-foreground mt-1">Add a bank account to withdraw your earnings</p>
                  <Link href="/freelancer/payments/bank-accounts/new" className="mt-4">
                    <Button>Add Bank Account</Button>
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

