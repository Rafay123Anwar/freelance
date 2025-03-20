// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
// export default function Home() {
//   return (
//     <div className="flex min-h-screen flex-col">
//       <header className="border-b">
//         <div className="container mx-auto flex h-16 items-center justify-between px-4">
//           <div className="text-xl font-bold">Freelance Platform</div>
//           <div className="flex gap-4">
//             <Link href="/login">
//               <Button variant="outline">Login</Button>
//             </Link>
//             <Link href="/register">
//               <Button>Register</Button>
//             </Link>
//           </div>
//         </div>
//       </header>
//       <main className="flex-1 flex items-center justify-center">
//         <section className="container mx-auto py-12 md:py-24 lg:py-32 px-4">
//           <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
//             <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
//               Connect with top freelancers & clients
//             </h1>
//             <p className="max-w-[46rem] text-lg text-muted-foreground sm:text-xl">
//               Find the perfect match for your project or discover exciting opportunities to showcase your skills.
//             </p>
//             <div className="flex flex-col gap-4 sm:flex-row">
//               <Link href="/register?type=client">
//                 <Button size="lg">Hire Talent</Button>
//               </Link>
//               <Link href="/register?type=freelancer">
//                 <Button size="lg" variant="outline">
//                   Find Work
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </section>
//       </main>
//             <footer className="border-t py-6">
//         <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
//           <p className="text-center text-sm text-muted-foreground md:text-left">
//             &copy; {new Date().getFullYear()} Freelance Platform. All rights reserved.
//           </p>
//           <div className="flex gap-4">
//             <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
//               <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" />
//             </a>
//             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
//               <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" />
//             </a>
//             <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
//               <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary" />
//             </a>
//             <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
//               <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
//             </a>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }



"use client"; // Mark this file as a Client Component

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useAuth } from "@/lib/auth-context"; // Import the useAuth hook

export default function Home() {
  // Use the useAuth hook to access authentication state and methods
  const { user, isLoading, login, logout } = useAuth();
  const baseRoute = user?.user_type === "client" ? "/client" : "/freelancer";
  const DashboardRoute = `${baseRoute}/dashboard`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-xl font-bold">Freelance Platform</div>
          <div className="flex gap-4">
            {user ? (
              // Show Dashboard and Logout buttons if user is logged in
              <>
                <Link href={DashboardRoute}>
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button onClick={logout} variant="outline">
                  Logout
                </Button>
              </>
            ) : (
              // Show Login and Register buttons if user is not logged in
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <section className="container mx-auto py-12 md:py-24 lg:py-32 px-4">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Connect with top freelancers & clients
            </h1>
            <p className="max-w-[46rem] text-lg text-muted-foreground sm:text-xl">
              Find the perfect match for your project or discover exciting opportunities to showcase your skills.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/register?type=client">
                <Button size="lg">Hire Talent</Button>
              </Link>
              <Link href="/register?type=freelancer">
                <Button size="lg" variant="outline">
                  Find Work
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Freelance Platform. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}