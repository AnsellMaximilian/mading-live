"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";
import { useUser } from "@/context/UserContext";
import { useCommunity } from "@/context/CommunityContext";
import { cn } from "@/lib/utils";
import SurveyCard from "@/components/survey-card";
import PostCard from "@/components/post-card";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(20),
});

export default function PostsPage() {
  const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createClientComponentClient<Database>();

  const { community, sendMembersNotification } = useCommunity();
  const { currentUser } = useUser();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const postElements = useRef<Record<string, HTMLDivElement | null>>({});

  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<
    Database["public"]["Tables"]["posts"]["Row"][]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (currentUser && community) {
      setIsCreateLoading(true);

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          title: values.title,
          content: values.content,
          author_id: currentUser.id,
          community_id: community.id,
        })
        .select()
        .single();

      if (post && !error) {
        sendMembersNotification(
          "A community member has posted.",
          post.id,
          undefined,
          "post_creation"
        );
        setPosts((prev) => [...prev, post]);
      }
      form.reset();
      setIsCreateDialogOpen(false);
      setIsCreateLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (community) {
        const { data: posts } = await supabase
          .from("posts")
          .select()
          .eq("community_id", community.id);
        if (posts) {
          setPosts(posts);
        }
      }
    })();
  }, [community, supabase]);

  useEffect(() => {
    const postId = searchParams.get("postId");
    if (postId && postElements.current[postId] && posts.length > 0) {
      console.log("SCROLLING NOW");
      postElements.current[postId]!.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams, posts]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) {
      setPosts((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-4.5rem)] flex flex-col p-4">
      <div className="space-y-6">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Community Posts</h2>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Create</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-screen">
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
                <DialogDescription>
                  Create a post for your community.
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
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Title of your survey"
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
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={20}
                                  placeholder="Survey description."
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
        {posts.length > 0 ? (
          <div className="grid grid-cols-12 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="col-span-12 lg:col-span-12"
                ref={(element) => (postElements.current[post.id] = element)}
              >
                <PostCard post={post} handleDelete={handleDelete} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            No member of this community has posted anything. Create the first
            post!
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
