// "use client"

// import Link from "next/link"
// import { BarChart, DollarSign, Users, Briefcase } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { DashboardLayout } from "@/components/dashboard-layout"
// import { ProtectedRoute } from "@/components/protected-route"
// import { api } from "@/lib/api";
// import { toast } from "@/components/ui/use-toast";

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, DollarSign, FileText,Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";



interface Profile {
  total_jobs_posted: number;
  total_proposals_received: number;
  total_reviews_given: number;
  wallet_balance: string;
}



export default function ClientDashboardPage() {
  // const [profile, setProfile] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("/api/auth/client/stats/");
        setProfile(response.data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
      }
    }
    fetchProfile();
  }, []);


// export default function ClientDashboardPage() {
  return (
    <ProtectedRoute allowedUserTypes={["client"]}>
      <DashboardLayout>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_jobs_posted ?? 0}</div>
              <p className="text-xs text-muted-foreground">Job Posted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_proposals_received ?? 0}</div>
              <p className="text-xs text-muted-foreground">Recived Proposal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.wallet_balance?? "0"}</div>
              <p className="text-xs text-muted-foreground">Balance</p>
            </CardContent>
          </Card>
        </div>
        {/* <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Your recently posted jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((job) => (
                  <div key={job} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="font-medium">Website Development Project</div>
                      <div className="text-sm text-muted-foreground">Posted 3 days ago • 8 proposals</div>
                    </div>
                    <Link href={`/client/jobs/${job}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/client/jobs">
                  <Button variant="link">View all jobs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Proposals</CardTitle>
              <CardDescription>Latest proposals for your jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((proposal) => (
                  <div key={proposal} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-muted-foreground">For: Website Development Project</div>
                    </div>
                    <Link href={`/client/proposals/${proposal}`}>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/client/proposals">
                  <Button variant="link">View all proposals</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div> */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to perform</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Link href="/client/jobs/new">
                <Button>Post a New Job</Button>
              </Link>
              <Link href="/client/payments/deposit">
                <Button variant="outline">Add Funds</Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline">Check Messages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

