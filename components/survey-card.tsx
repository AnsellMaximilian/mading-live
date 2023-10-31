"use client";

import { Community } from "@/lib/types";
import React, { useState } from "react";
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
import { Badge } from "./ui/badge";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";

type Props = {
  survey: Database["public"]["Tables"]["surveys"]["Row"] & {
    survey_choices: Database["public"]["Tables"]["survey_choices"]["Row"][];
  };
  handleDelete: (id: string) => Promise<void>;
};

export default function SurveyCard({ survey, handleDelete }: Props) {
  const { currentUser } = useUser();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleDeleteSurvey = async () => {
    setIsDeleteLoading(true);
    await handleDelete(survey.id);
    setIsDeleteLoading(false);
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{survey.title}</CardTitle>
        <CardDescription>
          {survey.description ? survey.description : "No description."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          {survey.open ? (
            <Badge className="bg-green-400">Open</Badge>
          ) : (
            <Badge className="" variant="destructive">
              Closed
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {survey.creator_id === currentUser?.id && (
          <Button
            variant="destructive"
            onClick={handleDeleteSurvey}
            disabled={isDeleteLoading}
          >
            {isDeleteLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        )}
        {/* <Button variant="outline">Cancel</Button> */}
        <Link
          href={`/communities/${survey.community_id}/surveys/${survey.id}`}
          className=""
        >
          <Button>View</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
