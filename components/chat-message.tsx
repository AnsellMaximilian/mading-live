import { Message } from "@/lib/types";
import React, { HTMLProps } from "react";

type Props = HTMLProps<HTMLDivElement> & {
  message: Message;
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
        <div className="text-xs font-semibold">{message.username}</div>
        <div className="text-sm pr-10">{message.content}</div>
        <div className="text-xs text-muted-foreground absolute bottom-1 right-2">
          {message.time}
        </div>
      </div>
    </div>
  );
}
