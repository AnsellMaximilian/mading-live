"use client";

import { useUser } from "@/context/UserContext";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";
import { Loader2 } from "lucide-react";
import { useCommunity } from "@/context/CommunityContext";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  description: z
    .string()
    .max(30, {
      message: "Description must not be longer than 30 characters.",
    })
    .optional(),
});

export default function SettingsPage() {
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (community) {
      setIsLoading(true);
      const { data } = await supabase
        .from("communities")
        .update({ name: values.name, description: values.description })
        .eq("id", community.id)
        .select();

      setIsLoading(false);
    }
  }

  const { currentUser } = useUser();
  const { community } = useCommunity();

  useEffect(() => {
    if (community) {
      form.setValue("name", community.name);
      form.setValue("description", community.description || "");
    }
  }, [community, form]);

  const isAdmin = !!community?.members.find((m) => m.id === currentUser?.id)
    ?.is_admin;
  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col p-4">
      <div className="">
        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-lg font-medium">Community Settings</h3>
            <p className="text-sm text-muted-foreground">
              The owner and admins of this community will be able to change its
              settings.
            </p>
          </div>
          <Separator />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Name</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>Public community name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="submit" disabled={isLoading || !isAdmin}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAdmin ? "Update Community" : "Missing Privilege"}
              </Button>
            </form>
          </Form>
        </div>
      </div>{" "}
    </div>
  );
}
