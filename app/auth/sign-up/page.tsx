"use client";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import fullLogo from "@/assets/images/logo-full.svg";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { Database } from "@/lib/schema";
import { UserAuthForm } from "@/components/ui/user-auth-form";

// export const metadata: Metadata = {
//   title: "Authentication",
//   description: "Authentication forms built using the components.",
// };

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const { currentUser, setCurrentUser } = useUser();

  const handleSignUp = async (email: string, password: string) => {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    router.push("/communities");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      <div className="container relative h-screen flex flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/auth/sign-in"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Login
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-orange-600" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image src={fullLogo} alt="full logo" className="w-40" />
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Kita adalah masyarakat yang terbentuk oleh
                perbedaan-perbedaan yang ada dalam diri kita. Persatuan dan
                kesatuan adalah kunci kekuatan kita, karena hanya dengan bersatu
                kita dapat mencapai cita-cita bersama.&rdquo;
              </p>
              <footer className="text-sm">Abdurrahman Wahid (Gus Dur)</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <Link href="/">
              <Image
                src={fullLogo}
                alt="full logo"
                className="w-40 mx-auto lg:hidden"
              />
            </Link>
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            <UserAuthForm handleSubmit={handleSignUp} type="SIGN_UP" />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
