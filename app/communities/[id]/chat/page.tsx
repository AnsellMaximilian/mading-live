"use client";

import React from "react";

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

const formSchema = z.object({
  message: z.string().min(2, {
    message: "Message must be at least 2 characters.",
  }),
});

export default function ChatPage() {
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
    console.log(values);
  }
  return (
    <div className="grow flex flex-col">
      <div className="grow p-4 flex flex-col justify-end">
        <div className="flex flex-col gap-2">
          <ChatMessage message="Hello, how are you?" time="10:01" />
          <ChatMessage
            message="Hello, how are you?"
            time="10:01"
            isCurrentUser
          />
          <ChatMessage message="Hello, how are you?" time="10:01" />
          <ChatMessage message="Hello, how are you?" time="10:01" />
          <ChatMessage message="Hello, how are you?" time="10:01" />
          <ChatMessage
            message="Hello, how are you?"
            time="10:01"
            isCurrentUser
          />
          <ChatMessage
            message="Hello, how are you?"
            time="10:01"
            isCurrentUser
          />
        </div>
      </div>
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
