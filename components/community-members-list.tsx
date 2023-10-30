"use client";

import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSpace, useMembers } from "@ably/spaces/react";

import { Community, CommunityMember } from "@/lib/types";
import { Badge } from "./ui/badge";
import { useUser } from "@/context/UserContext";

export default function CommunityMembersList({
  community,
}: {
  community: Community;
}) {
  const { space } = useSpace((update) => {
    // console.log(update);
  });

  const { currentUser } = useUser();

  const { others, self, connectionError, channelError, members } = useMembers();

  return (
    <Table>
      <TableCaption>A list of {community?.name}&apos;s members</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="">Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Full Name</TableHead>
          <TableHead className="">Role</TableHead>
          <TableHead className="">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {community?.members.map((cm) => (
          <TableRow key={cm.id}>
            <TableCell className="font-medium">{cm.username}</TableCell>
            <TableCell>{cm.email}</TableCell>
            <TableCell>{cm.full_name}</TableCell>
            <TableCell className="">
              {cm.is_admin ? "Admin" : "Member"}
            </TableCell>
            <TableCell className="">
              {members.find((ablyMember) => {
                return ablyMember.profileData?.id === cm.id;
              })?.isConnected ? (
                <Badge className="bg-green-400">Online</Badge>
              ) : (
                <Badge variant="secondary">Offline</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
