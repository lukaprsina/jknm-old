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
import { PublishForm } from "./publish_form"
import { SaveArticleType } from "~/server/data_layer/articles"

type PublishDrawerProps = {
    save: () => void
    fullSave: (input: SaveArticleType) => void
    imageUrls: string[]
    title: string
    articleId: number
    content: string
    url: string
    published: boolean
}

export function PublishDrawer({ imageUrls, articleId, content, save, fullSave, title, url, published }: PublishDrawerProps) {
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
                    <PublishForm
                        imageUrls={imageUrls}
                        article_id={articleId}
                        content={content}
                        fullSave={fullSave}
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
                <PublishForm
                    className="px-4"
                    imageUrls={imageUrls}
                    article_id={articleId}
                    content={content}
                    fullSave={fullSave}
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
