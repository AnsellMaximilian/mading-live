import { Database } from "@/lib/schema";
import { Message } from "@/lib/types";
import moment from "moment";
import React, { HTMLProps } from "react";

type Props = HTMLProps<HTMLDivElement> & {
  message: Database["public"]["Tables"]["chat_messages"]["Row"];
  isCurrentUser?: boolean;
};

export default function ChatMessage({ message, isCurrentUser = false }: Props) {
  return (
    <div className="flex">
      <div
        className={`${
          isCurrentUser ? "ml-auto" : ""
        } p-2 bg-red-100 rounded-md relative`}
      >
        <div className="text-xs font-semibold">{message.sender_username}</div>
        <div className="text-sm pr-10">{message.content}</div>
        <div className="text-xs text-muted-foreground absolute bottom-1 right-2">
          {moment(message.created_at).format("HH:mm")}
        </div>
      </div>
    </div>
  );
}
