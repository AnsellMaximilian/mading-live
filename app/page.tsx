import Image from "next/image";
import Link from "next/link";
import fullLogo from "@/assets/images/logo-full.svg";
import dashboard from "@/assets/images/screenshots/dashboard.png";
import chat from "@/assets/images/screenshots/chat.png";
import surveys from "@/assets/images/screenshots/surveys.png";
import posts from "@/assets/images/screenshots/posts.png";
import hero from "@/assets/images/hero.svg";
import { Button, buttonVariants } from "@/components/ui/button";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Wifi } from "lucide-react";

export default async function Home() {
  const cookieStore = cookies();

  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const user = (await supabase.auth.getSession()).data.session?.user;

  return (
    <div>
      <header className="border-b border-border">
        <nav className="max-w-6xl mx-auto container flex justify-between items-center py-4">
          <div>
            <Link href="/">
              <Image src={fullLogo} alt="app logo" width={120} />
            </Link>
            <ul>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>

          <div className="flex gap-2">
            {user ? (
              <Link
                href="/communities"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" })
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/auth/sign-up"
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main>
        <div className="max-w-5xl mx-auto container">
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <div className="my-6">
              <Image
                src={hero}
                alt="hero image"
                width={400}
                className="w-[500px]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <a href="https://ably.com/" target="_blank">
                  <Badge>Made with Ably</Badge>
                </a>
              </div>
              <h1 className="text-5xl font-semibold tracking-tight">
                Unite, Communicate, and Collaborate in{" "}
                <span className="text-orange-600 font-bold">Real Time</span>
              </h1>
              <div className="text-3xl tracking-tighter text-secondary-foreground">
                Empower Your Community with Real-Time Social Interaction
              </div>
              <Link href="/communities" className={cn(buttonVariants({}))}>
                Get Started
              </Link>
            </div>
          </div>
          <div className="mt-8 relative space-y-6">
            <div className="border-8 border-border rounded-md overflow-hidden ">
              <Image src={dashboard} alt="screenshot" className="w-full" />
            </div>
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-center">
                Real Time Community Dashboards
              </h2>
              <p className="text-center text-muted-foreground mt-4 text-xl">
                View and manage community and members data live
              </p>

              <div className="mt-4 text-xl text-center tracking-tight">
                Using Ably&apos;s Space feature along with its pub/sub
                connections, you can monitor your community data in real time.
                See how many members are online and know exacly who are!
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-32">
            <Wifi className="w-32 h-32 text-orange-600" />
          </div>
          <div className="mt-32">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-center">
                Take Advantage of Other Live Features
              </h2>
              <p className="text-center text-muted-foreground mt-4 text-xl">
                Experience real time social interaction with Ably
              </p>
            </div>
            <div className="space-y-10 mt-16">
              <div>
                <div className="grid grid-cols-12 gap-8">
                  <Image
                    src={chat}
                    className="border-4 border-border rounded-md overflow-hidden col-span-7"
                    alt="chat screenshot"
                  />
                  <div className="col-span-5">
                    <h3 className="tracking-tight text-2xl font-medium mb-4">
                      Chat with community members in real time
                    </h3>
                    <p className="text-xl">
                      Communicate within your communities live. Using Ably&apos;
                      pub/sub features, you will be able to chat with your
                      fellow community-mates in real time. Send and respond to
                      messages quickly.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-5">
                    <h3 className="tracking-tight text-2xl font-medium mb-4">
                      Take surveys and get real time answers and results
                    </h3>
                    <p className="text-xl">
                      Need to gauge community opinions or take a vote? Visit
                      your community&apos;s survey tab. Create a survey,
                      establish choices, and watch your community answer in real
                      time.
                    </p>
                  </div>
                  <Image
                    src={surveys}
                    className="border-4 border-border rounded-md overflow-hidden col-span-7"
                    alt="chat screenshot"
                  />
                </div>
              </div>
              <div>
                <div className="grid grid-cols-12 gap-8">
                  <Image
                    src={posts}
                    className="border-4 border-border rounded-md overflow-hidden col-span-7"
                    alt="chat screenshot"
                  />
                  <div className="col-span-5">
                    <h3 className="tracking-tight text-2xl font-medium mb-4">
                      Post and share things to your community
                    </h3>
                    <p className="text-xl">
                      Share stories, announcements, and other things within your
                      communities. Get notified whenever a community-mate shares
                      something.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-primary text-primary-foreground mt-24">
        <div className="container max-w-6xl py-4 mx-auto">
          <Link href="/">
            <Image src={fullLogo} alt="app logo" width={120} />
          </Link>
          <div className="text-sm text-center">
            Ansell Maximilian · &copy;2023
          </div>
        </div>
      </footer>
    </div>
  );
}
