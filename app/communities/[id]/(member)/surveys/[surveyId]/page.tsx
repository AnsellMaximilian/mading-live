"use client";

import { Database } from "@/lib/schema";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Survey } from "../page";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";
import { useCommunity } from "@/context/CommunityContext";
import { useChannel, useAbly } from "ably/react";
import { Types } from "ably";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function SurveyPage() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const supabase = createClientComponentClient<Database>();
  const { surveyId } = useParams();
  const { currentUser } = useUser();
  const { community } = useCommunity();
  const ablyClient = useAbly();
  const { toast } = useToast();

  const [answers, setAnswers] = useState<
    Database["public"]["Tables"]["survey_answers"]["Row"][]
  >([]);

  const [userAnswer, setUserAnswer] = useState<
    Database["public"]["Tables"]["survey_answers"]["Row"] | null
  >(null);

  const surveyChannel = useMemo(() => {
    return ablyClient.channels.get(`survey:${survey?.id}`);
  }, [survey, ablyClient.channels]);

  useEffect(() => {
    const listener = (ablyMessage: Types.Message) => {
      if (ablyMessage.name === "answer") {
        const answer: Database["public"]["Tables"]["survey_answers"]["Row"] =
          ablyMessage.data;
        setAnswers((prev) => [...prev, answer]);
      }
    };
    surveyChannel.subscribe(listener);

    return () => {
      surveyChannel.unsubscribe(listener);
    };
  }, [surveyChannel]);

  useEffect(() => {
    (async () => {
      if (currentUser) {
        const { data: survey } = await supabase
          .from("surveys")
          .select("*, survey_choices(*)")
          .eq("id", surveyId)
          .single();

        setSurvey(survey);

        if (survey) {
          const { data: answers } = await supabase
            .from("survey_answers")
            .select()
            .eq("survey_id", survey.id);
          const userAnswer = answers?.find(
            (ans) => ans.user_id === currentUser.id
          );
          setAnswers(answers ? answers : []);
          setUserAnswer(userAnswer ? userAnswer : null);
        }
      }
    })();
  }, [supabase, surveyId, currentUser]);

  const handleChoose = async (choiceId: string) => {
    if (currentUser && survey && !userAnswer && survey.open) {
      const { data: answer } = await supabase
        .from("survey_answers")
        .insert({
          user_id: currentUser.id,
          survey_id: survey.id,
          choice_id: choiceId,
        })
        .select()
        .single();
      if (answer) {
        surveyChannel.publish("answer", answer);

        setUserAnswer(answer);
      }
    }
    if (userAnswer) {
      toast({
        title: `You have already answered in the survey!`,
        description: `Only one answer allowed per survey.`,
      });
    }
  };

  const choiceDistribution: { [id: string]: number } = useMemo(() => {
    if (survey && answers.length > 0) {
      return survey.survey_choices.reduce<{ [id: string]: number }>(
        (obj, choice) => {
          obj[choice.id] =
            (answers.filter((ans) => ans.choice_id === choice.id).length /
              answers.length) *
            100;

          return obj;
        },
        {}
      );
    }

    return {};
  }, [survey, answers]);

  return (
    <div className="p-4 h-[calc(100vh-4.5rem)] flex flex-col overflow-y-auto">
      {survey ? (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium">Community Survey</p>
            <div className="flex justify-between">
              <h2 className="text-3xl font-bold tracking-tight">
                {survey.title}
              </h2>
              {survey.open ? (
                <Badge className="bg-green-400">Open</Badge>
              ) : (
                <Badge variant="destructive">Closed</Badge>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {survey.survey_choices.map((choice) => (
              <button
                onClick={() => handleChoose(choice.id)}
                key={choice.id}
                className={`block w-full relative overflow-hidden border border-border rounded-md hover:border-primary transition-all duration-200 ${
                  userAnswer?.choice_id === choice.id ? "ring rign-ring" : ""
                }`}
              >
                <div
                  className="absolute inset-y-0 bg-secondary"
                  style={{
                    width: `${choiceDistribution[choice.id]}%`,
                  }}
                ></div>
                <div className="relative p-2 flex justify-between">
                  <div>{choice.text}</div>
                  <div>{choiceDistribution[choice.id]}%</div>
                </div>
              </button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground flex justify-end">
            {answers.length} answered
          </div>
          <div>
            {survey.description
              ? survey.description
              : "No description for this survey."}
          </div>
          {/* {survey.open && (
            <div>
              <Button variant="destructive">Close Survey</Button>
            </div>
          )} */}
        </div>
      ) : (
        <div className="grow flex items-center justify-center">
          <Loader2 className="w-16 h-16 animate-spin" />
        </div>
      )}
    </div>
  );
}
