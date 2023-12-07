"use client";

import { ChatMessage as IChatMessage } from "@/app/communities/[id]/(member)/chat/page";
import { MoreHorizontal, Reply } from "lucide-react";
import moment from "moment";
import React, { HTMLProps, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChannel, useAbly } from "ably/react";
import { useCommunity } from "@/context/CommunityContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";

type Props = HTMLProps<HTMLDivElement> & {
  message: IChatMessage;
  isCurrentUser?: boolean;
  setHighlightedMessageId: (id: string | null) => void;
  handleReply: () => void;
};

export default function ChatMessage({
  message,
  isCurrentUser = false,
  setHighlightedMessageId,
  handleReply,
}: Props) {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const ablyClient = useAbly();
  const { community } = useCommunity();
  const supabase = createClientComponentClient<Database>();

  const chatChannel = useMemo(() => {
    return ablyClient.channels.get(`messages:${community?.id}`);
  }, [community, ablyClient]);

  const handleDelete = async () => {
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", message.id);
    if (!error) {
      chatChannel.publish("delete", message.id);
    }
  };

  return (
    <div className="flex">
      <div className={`${isCurrentUser ? "ml-auto" : ""} `}>
        {message.repliedMessage && (
          <button
            className="text-xs mb-1 flex gap-1 items-center hover:underline"
            onClick={() => {
              if (message.repliedMessage) {
                const repliedMessageElement = document.getElementById(
                  message.repliedMessage.id
                );

                if (repliedMessageElement) {
                  repliedMessageElement.scrollIntoView({ behavior: "smooth" });
                  setHighlightedMessageId(message.repliedMessage.id);
                } else {
                  toast({
                    title: "Message not loaded.",
                    description:
                      "Load more messages to find the replied message.",
                  });
                }
              }
            }}
          >
            <Reply size={10} />
            <div>
              Replied to{" "}
              <span className="font-bold">
                {message.repliedMessage.sender_username}
              </span>
              :{" "}
              <span className="text-muted-foreground">{`"${message.repliedMessage.content}"`}</span>
            </div>
          </button>
        )}
        <div className="p-2 bg-orange-100 rounded-md relative group">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={`absolute right-1 top-1 group-hover:block ${
                  menuOpen ? "" : "hidden"
                }`}
              >
                <MoreHorizontal size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleReply}>Reply</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="text-xs font-semibold">{message.sender_username}</div>
          <div className="text-sm pr-10">{message.content}</div>
          <div className="text-xs text-muted-foreground absolute bottom-1 right-2">
            {moment(message.created_at).format("HH:mm")}
          </div>
        </div>
      </div>
    </div>
  );
}
