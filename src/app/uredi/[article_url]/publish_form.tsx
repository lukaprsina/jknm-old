"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  save_article,
  type SaveArticleType,
} from "~/server/data_layer/articles";

const formSchema = z.object({
  title: z.string(),
  url: z.string(),
  published: z.boolean(),
});

type PublishFormProps = {
  fullSave: (input: SaveArticleType) => void;
  imageUrls: string[];
  title: string;
  url: string;
  article_id: number;
  content: string;
  published: boolean;
} & React.ComponentProps<"form">;

export function PublishForm({
  title,
  url,
  published,
  article_id,
  content,
  imageUrls,
  fullSave,
}: PublishFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title,
      url,
      published,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    fullSave({
      id: article_id,
      content,
      ...values,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Naslov</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Naslov novičke</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Določen URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Ko bo novička objavljena, bo dostopna na tem URL-ju.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Objavi novičko?</FormLabel>
                <FormDescription>
                  Če je označeno, je novička objavljena, drugače je osnutek.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit">Oddaj</Button>
      </form>
    </Form>
  );
}
