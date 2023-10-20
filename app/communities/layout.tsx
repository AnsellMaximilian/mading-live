import Sidebar from "@/components/Sidebar";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex grow">
        <Sidebar />
        <main className="grow flex flex-col">
          <header className="px-3 py-1 border-b border-border">
            <div className="h-16 flex items-center">
              <Avatar className="ml-auto w-8 h-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <div className="grow flex flex-col">{children}</div>
        </main>
      </div>
    </div>
  );
}
