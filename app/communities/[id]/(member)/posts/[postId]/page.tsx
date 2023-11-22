"use client";

import { Database } from "@/lib/schema";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, MoreVertical, Reply } from "lucide-react";
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
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [repliedCommentId, setRepliedCommentId] = useState<string | null>(null);
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

  const replyForm = useForm<z.infer<typeof formSchema>>({
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
          replied_comment_id: repliedCommentId,
        };
      const { data: comment } = await supabase
        .from("post_comments")
        .insert(createdComment)
        .select()
        .single();
      setRepliedCommentId(null);
      if (comment) {
        postChannel.publish("comment", comment);
        // Send notification to post author
        if (community) {
          const { data: notification } = await supabase
            .from("notifications")
            .insert({
              user_id: post.author_id,
              community_id: community.id,
              title: `Someone commented on your post "${post.title}"`,
              read: false,
              type: "post_creation",
            })
            .select()
            .single();
          if (notification) {
            const notificationChannel = ablyClient.channels.get(
              `notifications:${post.author_id}`
            );
            notificationChannel.publish("add", notification);
          }
        }
      }
    }

    form.reset({ content: "" });
    replyForm.reset({ content: "" });
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
                    <div className="flex gap-4 text-xs items-start">
                      <div className="">
                        Comment as{" "}
                        <span className="font-bold">
                          {currentUser?.profile.username}
                        </span>
                      </div>
                    </div>
                    <Button type="submit" size="sm">
                      Comment
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            <div className="pb-16">
              {comments.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {comments
                    .filter((c) => !c.replied_comment_id)
                    .map((comment) => (
                      <div key={comment.id}>
                        <div className="p-2 bg-secondary rounded-md group relative">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                {
                                  community?.members.find(
                                    (m) => m.id === comment.user_id
                                  )?.username
                                }
                              </div>
                              <div>{comment.content}</div>
                            </div>
                            <Popover>
                              <PopoverTrigger asChild className="">
                                <button className="items-center justify-center flex hover:text-muted-foreground">
                                  <MoreVertical size={14} />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="px-0 py-1 w-24">
                                <Button
                                  onClick={() => {
                                    setRepliedCommentId(comment.id);
                                    console.log(comment.id);
                                  }}
                                  className="w-full justify-start"
                                  variant="ghost"
                                >
                                  Reply
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        {comments
                          .filter((c) => c.replied_comment_id === comment.id)
                          .map((comment) => (
                            <div
                              key={comment.id}
                              className="ml-4 mt-4 p-2 bg-secondary rounded-md group relative"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-xs text-muted-foreground">
                                    {
                                      community?.members.find(
                                        (m) => m.id === comment.user_id
                                      )?.username
                                    }
                                  </div>
                                  <div>
                                    {comment.replied_comment_id && (
                                      <span className="font-semibold text-blue-500">
                                        @
                                        {
                                          community?.members.find(
                                            (m) =>
                                              m.id ===
                                              comments.find(
                                                (c) =>
                                                  c.id ===
                                                  comment.replied_comment_id
                                              )?.user_id
                                          )?.username
                                        }{" "}
                                      </span>
                                    )}
                                    {comment.content}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        {repliedCommentId &&
                          repliedCommentId === comment.id && (
                            <Form {...replyForm}>
                              <form
                                onSubmit={replyForm.handleSubmit(handleComment)}
                                className="space-y-2 mt-4 pl-2"
                              >
                                <div className="flex gap-2 items-center">
                                  <Reply />
                                  <FormField
                                    control={replyForm.control}
                                    name="content"
                                    render={({ field }) => (
                                      <FormItem className="grow">
                                        <FormControl>
                                          <Input
                                            placeholder="Reply"
                                            type="text"
                                            autoComplete="off"
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={() => setRepliedCommentId(null)}
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" size="sm">
                                    Reply
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          )}
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
