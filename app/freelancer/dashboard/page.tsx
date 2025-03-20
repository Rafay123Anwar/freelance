// "use client"

// import Link from "next/link"
// import { BarChart, DollarSign, FileText, Users } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { DashboardLayout } from "@/components/dashboard-layout"
// import { ProtectedRoute } from "@/components/protected-route"
// import { api } from "@/lib/api"
// import { toast } from "@/components/ui/use-toast"



// export default function FreelancerDashboardPage() {
//   return (
//     <ProtectedRoute allowedUserTypes={["freelancer"]}>
//       <DashboardLayout>
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
//               <FileText className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">0</div>
//               <p className="text-xs text-muted-foreground">+4 from last month</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
//               <Users className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">3</div>
//               <p className="text-xs text-muted-foreground">+1 from last month</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
//               <BarChart className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">7</div>
//               <p className="text-xs text-muted-foreground">+2 from last month</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">$2,845.00</div>
//               <p className="text-xs text-muted-foreground">+$650.00 from last month</p>
//             </CardContent>
//           </Card>
//         </div>
//         <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//           <Card className="col-span-4">
//             <CardHeader>
//               <CardTitle>Active Jobs</CardTitle>
//               <CardDescription>Your current active jobs</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {[1, 2, 3].map((job) => (
//                   <div key={job} className="flex items-center justify-between border-b pb-4">
//                     <div>
//                       <div className="font-medium">E-commerce Website Development</div>
//                       <div className="text-sm text-muted-foreground">Client: Acme Inc. • Due in 14 days</div>
//                     </div>
//                     <Link href={`/freelancer/jobs/${job}`}>
//                       <Button variant="outline" size="sm">
//                         View Details
//                       </Button>
//                     </Link>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-4 text-center">
//                 <Link href="/freelancer/jobs">
//                   <Button variant="link">View all jobs</Button>
//                 </Link>
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="col-span-3">
//             <CardHeader>
//               <CardTitle>Recent Proposals</CardTitle>
//               <CardDescription>Your recently submitted proposals</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {[1, 2, 3].map((proposal) => (
//                   <div key={proposal} className="flex items-center justify-between border-b pb-4">
//                     <div>
//                       <div className="font-medium">Mobile App Development</div>
//                       <div className="text-sm text-muted-foreground">Status: Pending • Submitted 2 days ago</div>
//                     </div>
//                     <Link href={`/freelancer/proposals/${proposal}`}>
//                       <Button variant="outline" size="sm">
//                         View
//                       </Button>
//                     </Link>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-4 text-center">
//                 <Link href="/freelancer/proposals">
//                   <Button variant="link">View all proposals</Button>
//                 </Link>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//         <div className="mt-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Quick Actions</CardTitle>
//               <CardDescription>Common tasks you might want to perform</CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-wrap gap-4">
//               <Link href="/jobs">
//                 <Button>Find Jobs</Button>
//               </Link>
//               <Link href="/freelancer/payments/withdraw">
//                 <Button variant="outline">Withdraw Funds</Button>
//               </Link>
//               <Link href="/messages">
//                 <Button variant="outline">Check Messages</Button>
//               </Link>
//             </CardContent>
//           </Card>
//         </div>
//       </DashboardLayout>
//     </ProtectedRoute>
//   )
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, DollarSign, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";


interface Profile {
  total_jobs_applied: number;
  total_proposals_sent: number;
  total_earnings: string;
  total_reviews: number;
  wallet_balance: string;
}



export default function FreelancerDashboardPage() {
  // const [profile, setProfile] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("/api/auth/freelancer/stats/");
        setProfile(response.data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
      }
    }
    fetchProfile();
  }, []);

  // if (loading) return <p className="text-center text-lg">Loading...</p>;
  // if (!profile) return <p className="text-center text-red-500">Error loading profile</p>;

  return (
    <ProtectedRoute allowedUserTypes={["freelancer"]}>
      <DashboardLayout>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs Applied</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_jobs_applied ?? 0}</div>
              <p className="text-xs text-muted-foreground">Applied Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposal Send</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_proposals_sent ?? 0}</div>
              <p className="text-xs text-muted-foreground">Proposal Send</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.wallet_balance ?? 0}</div>
              <p className="text-xs text-muted-foreground">Balance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${profile?.total_earnings ?? "0.00"}</div>
              <p className="text-xs text-muted-foreground">Earning Balance</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to perform</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Link href="/jobs">
                <Button>Find Jobs</Button>
              </Link>
              <Link href="/freelancer/payments/withdraw">
                <Button variant="outline">Withdraw Funds</Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline">Check Messages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
