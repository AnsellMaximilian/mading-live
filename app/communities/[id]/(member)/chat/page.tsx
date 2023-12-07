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
import { useInView } from "react-intersection-observer";
import chatBg from "@/assets/images/chat-bg.svg";

const formSchema = z.object({
  message: z.string().min(1, {
    message: "Message must be at least 1 characters.",
  }),
});

export type ChatMessage =
  Database["public"]["Tables"]["chat_messages"]["Row"] & {
    repliedMessage?: Database["public"]["Tables"]["chat_messages"]["Row"];
  };

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const { currentUser } = useUser();

  const inputRef = useRef<HTMLInputElement>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [currentBottomId, setCurrentBottomId] = useState<string | null>(null);
  const [noMoreMessages, setNoMoreMessages] = useState(false);

  const { community } = useCommunity();

  const ablyClient = useAbly();

  const supabase = createClientComponentClient<Database>();

  const chatChannel = useMemo(() => {
    return ablyClient.channels.get(`messages:${community?.id}`);
  }, [community, ablyClient]);

  const [repliedMessage, setRepliedMessage] = useState<null | ChatMessage>(
    null
  );

  const [highlightedMessageId, setHighlightedMessageId] = useState<
    null | string
  >(null);

  useEffect(() => {
    const listener = (ablyMessage: Types.Message) => {
      if (ablyMessage.name === "add") {
        const message: ChatMessage = ablyMessage.data;
        setMessages((prev) => [...prev, message]);
      }
    };
    chatChannel.subscribe(listener);

    return () => {
      chatChannel.unsubscribe(listener);
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
          replied_message_id: repliedMessage ? repliedMessage.id : null,
        };
      const { data: message } = await supabase
        .from("chat_messages")
        .insert(createdMessage)
        .select()
        .single();
      if (message) {
        chatChannel.publish("add", {
          ...message,
          repliedMessage: repliedMessage ? repliedMessage : undefined,
        });
        setRepliedMessage(null);
      }
    }

    form.reset({ message: "" });
  }

  useEffect(() => {
    (async () => {
      if (community) {
        setIsMessagesLoading(true);
        const { data: messages } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("community_id", community.id)
          .order("created_at", { ascending: false })
          .range(0, 15);

        if (messages) {
          if (messages.length < 16) {
            setNoMoreMessages(true);
          }
          const reversedMessages = messages.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateA.getTime() - dateB.getTime();
          });

          const { data: repliedMessages } = await supabase
            .from("chat_messages")
            .select()
            .in(
              "id",
              messages
                .filter((m) => m.replied_message_id)
                .map((m) => m.replied_message_id)
            );

          setMessages(
            reversedMessages.map((m) => ({
              ...m,
              sender_username:
                community.members.find((cm) => cm.id === m.user_id)?.username ||
                m.sender_username,
              repliedMessage: repliedMessages?.find(
                (rm) => rm.id === m.replied_message_id
              ),
            }))
          );
        }
        setIsMessagesLoading(false);
      }
    })();
  }, [supabase, community]);

  const loadMoreMessages = async () => {
    if (!noMoreMessages && community) {
      if (community) {
        setIsMessagesLoading(true);
        const { data: newMessages } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("community_id", community.id)
          .order("created_at", { ascending: false })
          .range(messages.length, messages.length + 15);

        if (newMessages) {
          if (newMessages.length < 16) {
            setNoMoreMessages(true);
          }
          const reversedMessages = newMessages.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateA.getTime() - dateB.getTime();
          });
          const { data: repliedMessages } = await supabase
            .from("chat_messages")
            .select()
            .in(
              "id",
              messages
                .filter((m) => m.replied_message_id)
                .map((m) => m.replied_message_id)
            );
          setMessages((prev) => [
            ...reversedMessages.map((m) => ({
              ...m,
              sender_username:
                community.members.find((cm) => cm.id === m.user_id)?.username ||
                m.sender_username,
              repliedMessage: repliedMessages?.find(
                (rm) => rm.id === m.replied_message_id
              ),
            })),

            ...prev,
          ]);
        }
        setIsMessagesLoading(false);
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setCurrentBottomId(messages[messages.length - 1].id);
    }
  }, [messages]);
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentBottomId]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (highlightedMessageId) {
      timeout = setTimeout(() => {
        setHighlightedMessageId(null);
      }, 1000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [highlightedMessageId]);
  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col">
      <ScrollArea
        className="absolute h-full inset-x-0 px-4 flex flex-col justify-end"
        style={{
          background: `url("${chatBg.src as string}")`,
        }}
      >
        {!noMoreMessages && (
          <div className="flex justify-center mt-2 gap-2 items-center">
            <div className="h-[1px] bg-orange-500 grow"></div>
            <Button
              className="mx-auto"
              variant="outline"
              disabled={isMessagesLoading}
              onClick={() => loadMoreMessages()}
            >
              {isMessagesLoading ? "Loading..." : "Load More"}
            </Button>
            <div className="h-[1px] bg-orange-500 grow"></div>
          </div>
        )}
        <div className="flex flex-col gap-2 py-2 relative">
          {messages.map((message, idx) => {
            const messageDay = moment(message.created_at);
            const isFirstOfDay =
              idx === 0 ||
              !messageDay.isSame(messages[idx - 1]?.created_at, "day");

            const isToday = messageDay.isSame(moment(), "day");
            const isYesterday = messageDay.isSame(
              moment().subtract(1, "day"),
              "day"
            );

            return (
              <div key={message.id}>
                {isFirstOfDay && (
                  <div className="flex justify-center mb-4">
                    <div className="bg-secondary text-secondary-foreground shadow-sm px-4 py-1 rounded-sm text-xs">
                      {isToday
                        ? "Today"
                        : isYesterday
                        ? "Yesterday"
                        : moment(message.created_at).format("DD MMM, YYYY")}
                    </div>
                  </div>
                )}
                <div
                  id={message.id}
                  onDoubleClick={() => {
                    setRepliedMessage(message);
                    inputRef.current?.focus();
                  }}
                  className={`transition-all duration-150 ${
                    highlightedMessageId === message.id ? "bg-orange-50" : ""
                  }`}
                >
                  <ChatMessage
                    message={message}
                    isCurrentUser={currentUser?.id === message.user_id}
                    setHighlightedMessageId={setHighlightedMessageId}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div ref={chatBottomRef} className="relative top-24"></div>
      </ScrollArea>
      <div>
        {repliedMessage && (
          <div className="bg-slate-200 p-4 text-sm text-muted-foreground flex justify-between items-center">
            <div>
              <div className="">
                Replying to{" "}
                <span className="font-bold">
                  {repliedMessage.sender_username}
                </span>
              </div>
              <div>{`> ${repliedMessage.content}`}</div>
            </div>
            <button
              className="hover:font-bold text-lg"
              onClick={() => setRepliedMessage(null)}
            >
              &times;
            </button>
          </div>
        )}
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
                        ref={inputRef}
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
    </div>
  );
}
