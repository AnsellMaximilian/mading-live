"use client";

import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { SendHorizontal } from "lucide-react";

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

const formSchema = z.object({
  message: z.string().min(2, {
    message: "Message must be at least 2 characters.",
  }),
});

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        content: values.message,
        time: "11:30",
      },
    ]);

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
              message={message.content}
              time={message.time}
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
