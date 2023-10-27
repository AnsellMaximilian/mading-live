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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckIcon } from "lucide-react";
import { UserNav } from "@/components/ui/user-nav";
import Notifications from "@/components/ui/notifications";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

export default function CommunitiesPage() {
  const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [communities, setCommunities] = useState<Community[]>([]);

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
        setIsLoading(true);
        const { data } = await supabase
          .from("communities")
          .select("*, community_members!inner(user_id)")
          .eq("community_members.user_id", currentUser.id);
        if (data) setCommunities(data);
        setIsLoading(false);
      }
    })();
  }, [currentUser]);

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

      if (data) router.push(`/communities/${data.id}`);

      setIsCreateLoading(false);
    }
  }

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-3 py-1 border-b border-border h-[4.5rem] flex items-center">
        <div className="flex items-center grow">
          <div className="ml-auto flex items-center gap-2">
            <Notifications />

            <UserNav />
          </div>
        </div>
      </header>
      {!isLoading && communities.length > 0 && (
        <div className="p-4">
          <div className="grid gap-2 grid-cols-12">
            {communities.map((community) => (
              <div
                key={community.id}
                className="col-span-12 md:col-span-6 lg:col-span-4"
              >
                <CommunityCard community={community} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && communities.length <= 0 && (
        <div className="grow flex items-center justify-center bg-secondary">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Create community</CardTitle>
              <CardDescription>Create your first community.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent>
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
                              <FormLabel>Name</FormLabel>
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
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button disabled={isCreateLoading}>
                    {isCreateLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      )}
    </div>
  );
}
