import * as React from "react"

import { cn } from "@/lib/utils"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "../../components/ui/separator"

type PublishDrawerProps = {
    onClick: () => void
    imageUrls: string[]
    title: string
    url: string
    published: boolean
    setPublished: (published: boolean) => void
}

export function PublishDrawer({ imageUrls, onClick, title, url, published, setPublished }: PublishDrawerProps) {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Objavi novičko</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Objavi novičko</DialogTitle>
                        <DialogDescription>
                            <span>Ime:</span>{' '}
                            <pre className="inline">{title}</pre>
                            <p />
                            <span>URL:</span>{' '}
                            <pre className="inline">{url}</pre>
                            <Separator />
                        </DialogDescription>
                    </DialogHeader>
                    <ProfileForm
                        imageUrls={imageUrls}
                        onClick={onClick}
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
                        <span>Ime:</span>
                        <pre>{title}</pre>
                        <span>URL:</span>
                        <pre>{url}</pre>
                        <Separator />
                    </DrawerDescription>
                </DrawerHeader>
                <ProfileForm
                    className="px-4"
                    imageUrls={imageUrls}
                    onClick={onClick}
                />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

type ProfileFormProps = {
    onClick: () => void
    imageUrls: string[]
} & React.ComponentProps<"form">

function ProfileForm({ className, imageUrls, onClick }: ProfileFormProps) {
    return (
        <form className={cn("grid items-start gap-4", className)}>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" defaultValue="shadcn@example.com" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="@shadcn" />
            </div>
            <div className="grid gap-2">
                {imageUrls.map((url) => (
                    <div key={url} className="flex items-center gap-2">
                        <img src={url} alt="image" className="w-12 h-12 rounded-lg" />
                    </div>
                ))}
            </div>
            <Button /* TODO: type="submit" */ onClick={() => onClick()}>Save changes</Button>
        </form>
    )
}

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