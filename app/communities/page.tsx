"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import fullLogo from "@/assets/images/logo-full.svg";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Community } from "@/lib/types";
import CommunityCard from "@/components/community-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckIcon } from "lucide-react";
import { UserNav } from "@/components/ui/user-nav";
import Notifications from "@/components/ui/notifications";
import Link from "next/link";
import Image from "next/image";
import LoadingScreen from "@/components/ui/loading-screen";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

export default function CommunitiesPage() {
  const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [communities, setCommunities] = useState<
    Database["public"]["Tables"]["communities"]["Row"][]
  >([]);

  const { currentUser } = useUser();
  const router = useRouter();

  const supabase = createClientComponentClient<Database>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    (async () => {
      if (currentUser) {
        const { data } = await supabase
          .from("communities")
          .select("*, community_members!inner(user_id)")
          .eq("community_members.user_id", currentUser.id);
        if (data) setCommunities(data);
        setIsLoading(false);
      }
    })();
  }, [currentUser, supabase]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (currentUser) {
      setIsCreateLoading(true);

      const { data, error } = await supabase
        .from("communities")
        .insert({
          name: values.name,
          description: values.description,
          owner_id: currentUser.id,
        })
        .select()
        .single();

      if (data) router.push(`/communities/${data.id}/dashboard`);

      setIsCreateLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("communities").delete().eq("id", id);

    if (!error) {
      setCommunities((prev) => prev.filter((s) => s.id !== id));
    }
  };

  if (isLoading)
    return (
      // <div className="h-screen flex items-center justify-center">
      //   Loading...
      // </div>
      <LoadingScreen />
    );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-1 border-b border-border h-[4.5rem] flex items-center justify-between">
        <Link href="/">
          <Image src={fullLogo} alt="app logo" width={120} />
        </Link>
        <div className="flex items-center grow">
          <div className="ml-auto flex items-center gap-2">
            <Notifications />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="p-4">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Your Communities
          </h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create New</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create community</DialogTitle>
                <DialogDescription>
                  Create your first community.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  id="community-form"
                >
                  <div className="grid gap-2">
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Name of your community"
                                  type="text"
                                  autoComplete="off"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Community description."
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
              <DialogFooter className="">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  disabled={isCreateLoading}
                  type="submit"
                  form="community-form"
                >
                  {isCreateLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {communities.length > 0 ? (
          <div className="grid gap-2 grid-cols-12">
            {communities.map((community) => (
              <div
                key={community.id}
                className="col-span-12 md:col-span-6 lg:col-span-4"
              >
                <CommunityCard
                  community={community}
                  handleDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>You do not belong to any communities.</div>
        )}
      </div>
    </div>
  );
}
