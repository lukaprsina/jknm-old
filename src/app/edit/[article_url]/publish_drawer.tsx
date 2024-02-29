"use client"

import { useMediaQuery } from "~/hooks/use_media_query"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { SaveArticleType } from "~/server/data_layer/articles"
import { Input } from "~/components/ui/input"
import { Checkbox } from "~/components/ui/checkbox"
import { Form, useForm } from "react-hook-form"
import { z } from "zod"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"

type PublishDrawerProps = {
    save: () => void
    imageUrls: string[]
    title: string
    articleId: number
    content: string
    url: string
    published: boolean
}

export function PublishDrawer({ imageUrls, articleId, content, save, title, url, published }: PublishDrawerProps) {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => save()} variant="outline">Objavi novičko</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Objavi novičko</DialogTitle>
                        <DialogDescription>
                            Shrani in objavi urejeno novičko
                        </DialogDescription>
                    </DialogHeader>
                    <ProfileForm
                        imageUrls={imageUrls}
                        article_id={articleId}
                        content={content}
                        save={save}
                        title={title}
                        url={url}
                        published={published}
                    />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline">Objavi novičko</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Objavi novičko</DrawerTitle>
                    <DrawerDescription>
                        Shrani in objavi urejeno novičko
                    </DrawerDescription>
                </DrawerHeader>
                <ProfileForm
                    className="px-4"
                    imageUrls={imageUrls}
                    article_id={articleId}
                    content={content}
                    save={save}
                    title={title}
                    url={url}
                    published={published}
                />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Prekliči</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

type ProfileFormProps = {
    save: (input: SaveArticleType) => void
    imageUrls: string[],
    title: string,
    url: string,
    article_id: number,
    content: string,
    published: boolean,
} & React.ComponentProps<"form">

function ProfileForm({ title, url, published, article_id, content, imageUrls, save }: ProfileFormProps) {
    const form = useForm<z.infer<typeof profile_form_schema>>({
        resolver: zodResolver(profile_form_schema),
        defaultValues: {
            title,
            url,
            published
        },
    })

    function onSubmit(values: z.infer<typeof profile_form_schema>) {
        console.log(values)
        save({
            id: article_id,
            title: values.title,
            url: values.url,
            content,
            published: values.published
        })
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
                            <FormDescription>
                                Naslov novičke
                            </FormDescription>
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
                                <FormLabel>
                                    Objavi novičko?
                                </FormLabel>
                                <FormDescription>
                                    Če je označeno, je novička objavljena, drugače je osnutek.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />
                <Button type="submit">Shrani</Button>
            </form>
        </Form>
    )
}

const profile_form_schema = z.object({
    title: z.string(),
    url: z.string(),
    published: z.boolean(),
})

/* 
<form
            className={cn("grid items-start gap-4", className)}
            onSubmit={async (formData) => {
                formData.preventDefault()
                console.log("Submitting form", formData)

                save({
                    id: "1",
                    title: "title",
                    url: "url",
                    content: "content",
                    published: true
                })
            }}
        >
            <InputWithLabel id="title" label="Naslov" />
            <InputWithLabel id="url" label="Url" />
            <CheckboxWithLabel id="published" label="Objavljeno" />
            <div className="grid gap-2">
                {imageUrls.map((url) => (
                    <div key={url} className="flex items-center gap-2">
                        <Image
                            src={url}
                            alt="image"
                            width={48}
                            height={48}
                            className="rounded-lg" />
                    </div>
                ))}
            </div>
            <Button type="submit">Save changes</Button>
        </form>
         */

/* 
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

type PublishDrawerProps = {
    onClick: () => void
    title: string
    url: string
}

export function PublishDrawer({ onClick, title, url }: PublishDrawerProps) {
    const [open, setOpen] = useState(false)

    return (
        <Drawer open={open} onOpenChange={(changed_open) => setOpen(changed_open)}>
            <DrawerTrigger asChild>
                <Button variant="outline">Objavi</Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Objavi novico {title}</DrawerTitle>
                        <DrawerDescription>URL: {url}</DrawerDescription>
                    </DrawerHeader>
                    <p>Here lies the cake</p>
                    <DrawerFooter>
                        <Button onClick={() => {
                            onClick();
                            setOpen(false)
                        }}>Publish</Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
} */