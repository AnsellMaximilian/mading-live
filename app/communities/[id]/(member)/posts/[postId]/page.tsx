"use client";

import { Database } from "@/lib/schema";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";
import { useCommunity } from "@/context/CommunityContext";
import { useChannel, useAbly } from "ably/react";
import { Types } from "ably";
import { useToast } from "@/components/ui/use-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { SendHorizontal } from "lucide-react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  content: z.string().min(2, {
    message: "Message must be at least 2 characters.",
  }),
});

export default function PostPage() {
  const [post, setPost] = useState<
    Database["public"]["Tables"]["posts"]["Row"] | null
  >(null);
  const supabase = createClientComponentClient<Database>();
  const { postId } = useParams();
  const { currentUser } = useUser();
  const { community } = useCommunity();
  const ablyClient = useAbly();
  const { toast } = useToast();
  const [comments, setComments] = useState<
    Database["public"]["Tables"]["post_comments"]["Row"][]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const postChannel = useMemo(() => {
    return ablyClient.channels.get(`post:${post?.id}`);
  }, [post, ablyClient.channels]);

  useEffect(() => {
    const listener = (ablyMessage: Types.Message) => {
      if (ablyMessage.name === "comment") {
        const comment: Database["public"]["Tables"]["post_comments"]["Row"] =
          ablyMessage.data;
        setComments((prev) => [...prev, comment]);
      }
    };
    postChannel.subscribe(listener);

    return () => {
      postChannel.unsubscribe(listener);
    };
  }, [postChannel]);

  useEffect(() => {
    (async () => {
      if (currentUser) {
        const { data: post } = await supabase
          .from("posts")
          .select()
          .eq("id", postId)
          .single();
        if (post) {
          const { data: comments } = await supabase
            .from("post_comments")
            .select()
            .eq("post_id", post.id);

          if (comments) {
            setComments(comments);
          }
        }
        setPost(post);
      }
    })();
  }, [supabase, postId, currentUser]);

  async function handleComment(values: z.infer<typeof formSchema>) {
    if (currentUser && post) {
      const createdComment: Database["public"]["Tables"]["post_comments"]["Insert"] =
        {
          content: values.content,
          user_id: currentUser.id,
          post_id: post.id,
        };
      const { data: comment } = await supabase
        .from("post_comments")
        .insert(createdComment)
        .select()
        .single();
      if (comment) {
        postChannel.publish("comment", comment);
      }
    }

    form.reset({ content: "" });
  }

  return (
    <div className="p-4 h-[calc(100vh-4.5rem)] flex flex-col overflow-y-auto">
      {post ? (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium">Community Post</p>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">
                {post.title}
              </h2>
              <div className="text-muted-foreground text-sm">
                Post by{" "}
                {
                  community?.members.find((m) => m.id === post.author_id)
                    ?.username
                }
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="whitespace-pre-line">{post.content}</div>
            <div>
              <div className="font-semibold mb-4">Post Comments</div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleComment)}
                  className="space-y-2"
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="grow">
                        <FormControl>
                          <Input
                            placeholder="Post a comment"
                            type="text"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs">
                      Comment as{" "}
                      <span className="font-bold">
                        {currentUser?.profile.username}
                      </span>
                    </div>
                    <Button type="submit" size="sm">
                      {/* <SendHorizontal size={20} /> */}
                      Comment
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            <div className="pb-16">
              {comments.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-2 bg-secondary rounded-md"
                    >
                      <div className="text-xs text-muted-foreground">
                        {
                          community?.members.find(
                            (m) => m.id === comment.user_id
                          )?.username
                        }
                      </div>
                      {comment.content}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  This post has no comments...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grow flex items-center justify-center">
          <Loader2 className="w-16 h-16 animate-spin" />
        </div>
      )}
    </div>
  );
}
