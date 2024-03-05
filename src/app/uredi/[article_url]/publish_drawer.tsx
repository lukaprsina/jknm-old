"use client"

import { useMediaQuery } from "~/hooks/use_media_query"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { useEffect, useState } from "react"
import { PublishForm } from "./publish_form"
import { SaveArticleType } from "~/server/data_layer/articles"
import { Article } from "@prisma/client"

type PublishDrawerProps = {
    save: () => Promise<Article | null>
    fullSave: (input: SaveArticleType) => void
    imageUrls: string[]
    title: string
    articleId: number
    content: string
    url: string
    published: boolean
}

export function Test({ save }: { save: () => Promise<Article | null> }) {
    const [someNum, setNum] = useState(0)


    useEffect(() => {
        console.log("someNum is", someNum)
        return () => {
            console.log("COMPONENT Test REMOUNTED")
        }
    }, [someNum])

    return (
        <button
            onClick={() => {
                save()
                    .then(() => {
                        setNum((num) => num + 1)
                        console.log("set someNum")
                    })
                    .catch((error) => console.error("Error setting: ", error, someNum))
            }}
        >
            Click me {someNum}
        </button>
    )
}

export function PublishDrawer({ imageUrls, articleId, content, save, fullSave, title, url, published }: PublishDrawerProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        console.log("open is ", drawerOpen)
    }, [drawerOpen])

    // TODO: the component if the article changes!!    

    if (isDesktop) {
        return (
            <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
                <Button
                    onClick={() => save().then(() => setDrawerOpen(true)).catch((error) => console.error("Error saving: ", error))}
                    variant="outline"
                >
                    Nastavitve novičke
                </Button>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Nastavitve novičke</DialogTitle>
                        <DialogDescription>
                            Uredi in objavi novičko
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
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Button onClick={async () => {
                await save()
                console.log("OPENING SETTINGS MOBILE")
                setDrawerOpen(true)
            }}>Nastavitve novičke</Button>
            <DrawerTrigger asChild>
                <Button variant="outline">Nastavitve novičke</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Nastavitve novičke</DrawerTitle>
                    <DrawerDescription>
                        Uredi in objavi novičko
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
