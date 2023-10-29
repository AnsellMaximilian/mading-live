"use client";

import React, { useState, useRef, useEffect } from "react";
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

const formSchema = z.object({
  message: z.string().min(2, {
    message: "Message must be at least 2 characters.",
  }),
});

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  const { currentUser } = useUser();

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const { community } = useCommunity();

  const ablyClient = useAbly();

  const { channel: messagesChannel, channelError } = useChannel(
    "messages",
    (ablyMessage: Types.Message) => {
      const message: Message = ablyMessage.data;
      setMessages((prev) => [...prev, message]);
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (currentUser) {
      const message: Message = {
        id: uuidv4(),
        username: currentUser.email || "ANON",
        content: values.message,
        time: moment().format("HH:MM"),
        userId: currentUser.id,
      };
      messagesChannel.publish("messages", message);

      const notificationChannel = ablyClient.channels.get("messages");
      notificationChannel.publish("messages", {
        id: uuidv4(),
        username: currentUser.email || "ANON",
        content: values.message,
        time: moment().format("HH:MM"),
        userId: currentUser.id,
      });
    }

    form.reset({ message: "" });
  }

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
              isCurrentUser={currentUser?.id === message.userId}
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
