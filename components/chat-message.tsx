import { ChatMessage } from "@/app/communities/[id]/(member)/chat/page";
import { Database } from "@/lib/schema";
import { Message } from "@/lib/types";
import { Reply } from "lucide-react";
import moment from "moment";
import React, { HTMLProps } from "react";

type Props = HTMLProps<HTMLDivElement> & {
  message: ChatMessage;
  isCurrentUser?: boolean;
};

export default function ChatMessage({ message, isCurrentUser = false }: Props) {
  return (
    <div className="flex">
      <div className={`${isCurrentUser ? "ml-auto" : ""} `}>
        {message.repliedMessage && (
          <div className="text-xs mb-1 flex gap-1 items-center">
            <Reply size={10} />
            <div>
              Replied to{" "}
              <span className="font-bold">
                {message.repliedMessage.sender_username}
              </span>
              :{" "}
              <span className="text-muted-foreground">{`"${message.repliedMessage.content}"`}</span>
            </div>
          </div>
        )}
        <div className="p-2 bg-orange-100 rounded-md relative">
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
