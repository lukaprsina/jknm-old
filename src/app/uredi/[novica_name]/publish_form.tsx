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
import Image from "next/image";
import useLog from "~/hooks/use_log";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

const form_schema = z.object({
  title: z.string(),
  url: z.string(),
  image_url: z.string(),
  published: z.boolean(),
});

// export form_schema as a type
export type PublishFormValues = z.infer<typeof form_schema>;

type PublishFormProps = {
  configure_article: (props: PublishFormValues) => void;
  imageUrls: string[];
  title: string;
  url: string;
  article_id: number;
  content: string;
  published: boolean;
  selectedImageUrl?: string;
  setDrawerOpen: (open: boolean) => void;
}

export function PublishForm({
  title,
  url,
  published,
  article_id,
  content,
  imageUrls,
  selectedImageUrl,
  configure_article,
  setDrawerOpen
}: PublishFormProps) {
  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      title,
      url,
      published,
      image_url: selectedImageUrl
    },
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    configure_article({
      title: values.title,
      url: values.url,
      published: values.published,
      image_url: values.image_url,
    });
    setDrawerOpen(false)
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
          name="image_url"
          render={({ field }) => (
            <SelectImage
              imageUrls={imageUrls}
              selectedImageUrl={field.value}
              setSelectedImageUrl={field.onChange}
            />
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

type SelectImageProps = {
  imageUrls: string[]
  selectedImageUrl?: string
  setSelectedImageUrl: (value: string) => void
}

export function SelectImage({ imageUrls, selectedImageUrl, setSelectedImageUrl }: SelectImageProps) {
  return (
    <FormItem>
      <FormLabel>Naslovna slika</FormLabel>
      <FormControl>
        <ToggleGroup
          type="single"
          className="justify-start h-28"
          value={selectedImageUrl}
          onValueChange={(value) => setSelectedImageUrl(value)}
        >
          {imageUrls.map((url) => (
            <ToggleGroupItem value={url} key={url} className="h-full">
              <Image
                key={url}
                src={url}
                alt="Slika"
                width={120}
                height={120}
                className="rounded-md h-auto"
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FormControl>
    </FormItem>
  );
}

{/* <Image
            key={url}
            src={url}
            alt="Slika"
            width={100}
            height={100}
            className="rounded-md"
          /> */}