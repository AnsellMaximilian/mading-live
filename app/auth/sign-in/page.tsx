"use client";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import fullLogo from "@/assets/images/logo-full.svg";
import { useToast } from "@/components/ui/use-toast";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { UserAuthForm } from "@/components/ui/user-auth-form";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const { handleSetUserWithProfile } = useUser();

  const handleSignIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (res.error) {
      toast({
        title: "Authentication Error",
        description: res.error.message,
      });
      return;
    } else if (res.data.session) {
      await handleSetUserWithProfile(res.data.session.user);
      router.push("/communities");
    }
  };

  return (
    <>
      <div className="container flex relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/auth/sign-up"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Register
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-orange-600" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image src={fullLogo} alt="full logo" className="w-40" />
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Komunitas yang kuat adalah yang mampu merangkul perbedaan
                dan bekerja bersama untuk mencapai tujuan bersama. Dalam
                keragaman, kita menemukan kekuatan.&rdquo;
              </p>
              <footer className="text-sm">Tri Rismaharini</footer>
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
              <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
              <p className="text-sm text-muted-foreground">
                Sign into your existing account.
              </p>
            </div>
            <UserAuthForm handleSubmit={handleSignIn} type="SIGN_IN" />
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
