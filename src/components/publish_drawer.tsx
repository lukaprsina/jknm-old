import { useState } from "react"
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons"

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
}
