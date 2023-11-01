"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChannel, useAbly } from "ably/react";
import type { Types } from "ably";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { SendHorizontal } from "lucide-react";
import moment from "moment";

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
import { Input } from "@/components/ui/input";
import ChatMessage from "@/components/chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/lib/types";
import { useUser } from "@/context/UserContext";
import { useCommunity } from "@/context/CommunityContext";
import { Database } from "@/lib/schema";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const formSchema = z.object({
  message: z.string().min(2, {
    message: "Message must be at least 2 characters.",
  }),
});

export default function ChatPage() {
  const [messages, setMessages] = useState<
    Database["public"]["Tables"]["chat_messages"]["Row"][]
  >([]);

  const { currentUser } = useUser();

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const { community } = useCommunity();

  const ablyClient = useAbly();

  const supabase = createClientComponentClient<Database>();

  const chatChannel = useMemo(() => {
    return ablyClient.channels.get(`messages:${community?.id}`);
  }, [community, ablyClient]);

  useEffect(() => {
    chatChannel.subscribe((ablyMessage: Types.Message) => {
      if (ablyMessage.name === "add") {
        const message: Database["public"]["Tables"]["chat_messages"]["Row"] =
          ablyMessage.data;
        setMessages((prev) => Array.from(new Set([...prev, message])));
      }
    });

    return () => {
      chatChannel.unsubscribe(console.log);
    };
  }, [chatChannel]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (currentUser && community) {
      const createdMessage: Database["public"]["Tables"]["chat_messages"]["Insert"] =
        {
          content: values.message,
          user_id: currentUser.id,
          community_id: community.id,
          sender_username: currentUser.profile.username,
        };
      const { data: message } = await supabase
        .from("chat_messages")
        .insert(createdMessage)
        .select()
        .single();

      chatChannel.publish("add", message);
    }

    form.reset({ message: "" });
  }

  useEffect(() => {
    (async () => {
      if (community) {
        const { data: messages } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("community_id", community.id);

        if (messages) {
          setMessages(messages);
        }
      }
    })();
  }, [supabase, community]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col">
      <ScrollArea className="absolute h-full inset-x-0 px-4 flex flex-col justify-end">
        <div className="flex flex-col gap-2 py-2 relative">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={currentUser?.id === message.user_id}
            />
          ))}
        </div>
        <div ref={chatBottomRef} className="relative top-24"></div>
      </ScrollArea>
      <div className="p-4 bg-accent">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormControl>
                    <Input
                      placeholder="How are you?"
                      type="text"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">
              <SendHorizontal size={20} />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
