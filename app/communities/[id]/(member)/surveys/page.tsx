"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/schema";
import { useUser } from "@/context/UserContext";
import { useCommunity } from "@/context/CommunityContext";
import { cn } from "@/lib/utils";
import SurveyCard from "@/components/survey-card";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  choices: z
    .array(
      z.object({
        text: z.string().min(2),
      })
    )
    .min(2),
});

export type Survey = Database["public"]["Tables"]["surveys"]["Row"] & {
  survey_choices: Database["public"]["Tables"]["survey_choices"]["Row"][];
};

export default function SurveysPage() {
  const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createClientComponentClient<Database>();

  const { community, sendMembersNotification } = useCommunity();
  const { currentUser } = useUser();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [surveys, setSurveys] = useState<Survey[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      choices: [{ text: "" }],
    },
  });
  const { fields, append } = useFieldArray({
    name: "choices",
    control: form.control,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (currentUser && community) {
      setIsCreateLoading(true);

      const { data: survey, error } = await supabase
        .from("surveys")
        .insert({
          title: values.title,
          description: values.description,
          creator_id: currentUser.id,
          community_id: community.id,
        })
        .select()
        .single();

      if (survey && !error) {
        const { data: choices, error } = await supabase
          .from("survey_choices")
          .insert(
            values.choices.map((choice) => ({
              text: choice.text,
              survey_id: survey.id,
            }))
          )
          .select();
        if (choices) {
          setSurveys((prev) => [
            ...prev,
            { ...survey, survey_choices: choices },
          ]);
        }
        sendMembersNotification(
          "A community survey has been created.",
          survey.id,
          undefined,
          "survey_creation"
        );
      }
      form.reset();
      setIsCreateDialogOpen(false);
      setIsCreateLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (community) {
        const { data: surveys } = await supabase
          .from("surveys")
          .select("*, survey_choices(*)")
          .eq("community_id", community.id);
        if (surveys) {
          setSurveys(surveys);
        }
      }
    })();
  }, [community, supabase]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("surveys").delete().eq("id", id);
    if (!error) {
      setSurveys((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col p-4">
      <div className="space-y-6">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Community Surveys
          </h2>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Create</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-screen">
              <DialogHeader>
                <DialogTitle>Create Survey</DialogTitle>
                <DialogDescription>
                  Create a survey for your community.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  id="community-form"
                >
                  <div className="grid gap-2">
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Title of your survey"
                                  type="text"
                                  autoComplete="off"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Survey description."
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        {fields.map((field, index) => (
                          <FormField
                            control={form.control}
                            key={field.id}
                            name={`choices.${index}.text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel
                                  className={cn(index !== 0 && "sr-only")}
                                >
                                  Choices
                                </FormLabel>
                                <FormDescription
                                  className={cn(index !== 0 && "sr-only")}
                                >
                                  Add choices for the survey.
                                </FormDescription>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => append({ text: "" })}
                        >
                          Add Choice
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
              <DialogFooter className="">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  disabled={isCreateLoading}
                  type="submit"
                  form="community-form"
                >
                  {isCreateLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {surveys.length > 0 ? (
          <div className="grid grid-cols-12 gap-2">
            {surveys.map((survey) => (
              <div key={survey.id} className="col-span-12 lg:col-span-6">
                <SurveyCard survey={survey} handleDelete={handleDelete} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            This community hasn&apos;t conducted any surveys. Start the first
            one!
          </div>
        )}
      </div>
    </div>
  );
}
