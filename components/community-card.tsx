import { Community } from "@/lib/types";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Database } from "@/lib/schema";

type Props = {
  community: Database["public"]["Tables"]["communities"]["Row"];
};

export default function CommunityCard({ community }: Props) {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{community.name}</CardTitle>
        <CardDescription>
          {community.description ? community.description : "No description."}
        </CardDescription>
      </CardHeader>
      <CardContent>You are a member of this community.</CardContent>
      <CardFooter className="flex justify-between">
        {/* <Button variant="outline">Cancel</Button> */}
        <Link
          href={`/communities/${community.id}/dashboard`}
          className="ml-auto"
        >
          <Button>View</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
