import React, { HTMLProps } from "react";

type Props = HTMLProps<HTMLDivElement> & {
  message: string;
  time: string;
  isCurrentUser?: boolean;
};

export default function ChatMessage({
  message,
  time,
  isCurrentUser = false,
}: Props) {
  return (
    <div className="flex">
      <div
        className={`${
          isCurrentUser ? "ml-auto" : ""
        } p-2 bg-red-100 rounded-md relative`}
      >
        <div className="text-sm pr-10">{message}</div>
        <div className="text-xs text-muted-foreground absolute bottom-1 right-2">
          {time}
        </div>
      </div>
    </div>
  );
}
