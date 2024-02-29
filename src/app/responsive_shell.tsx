"use client";

import Image from 'next/image';
import logo from '~/content/logo.png'
import { new_article, type new_article as new_article_type } from '../server/data_layer/articles'
import Link from 'next/link';
import { Pencil1Icon, PlusIcon } from "@radix-ui/react-icons"
import { usePathname, useRouter } from 'next/navigation';
import { HTMLProps, useMemo, useState } from 'react';
import { remove_article_prefix } from '~/lib/fs';
import { ModeToggle } from './mode_toggle';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Label } from '../components/ui/label';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { twMerge } from 'tailwind-merge';
import { $path } from 'next-typesafe-url';
import { User } from 'next-auth';

type TrimmedUser = {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
} // user, but omit emailVerified

type ResponsiveShellProps = {
    children: React.ReactNode
    editable?: boolean
    user?: TrimmedUser
}

export default function ResponsiveShell({ user, editable, children }: ResponsiveShellProps) {
    const pathname = usePathname()
    const [searchText, setSearchText] = useState('');

    const sanitized_url = useMemo(() => remove_article_prefix(pathname), [pathname])

    // https://github.dev/shadcn-ui/ui/tree/main/apps/www/components/site-header.tsx
    return <>
        {/* TODO: sticky */}
        <nav className=" top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <MobileNav />
                <MainNav
                    signedIn={typeof user !== "undefined"}
                    editable={editable ?? false}
                    new_article={new_article}
                    sanitized_url={sanitized_url}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    user={user}
                />
            </div>
        </nav>
        <main className="mt-4 min-w-full">
            {children}
        </main>
        <footer className="py-6 md:px-8 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <Footer />
            </div>
        </footer>
    </>
}

type MainNavProps = {
    editable: boolean
    signedIn: boolean
    new_article: typeof new_article_type
    searchText: string
    setSearchText: (value: string) => void
    sanitized_url: string
    user?: TrimmedUser
}

function MainNav({ editable, signedIn, new_article, sanitized_url, searchText, setSearchText, user }: MainNavProps) {
    const router = useRouter()

    return <>
        <div className="mr-4 hidden md:flex">
            <Link href="/" className="relative h-full flex mr-4 items-center gap-3">
                <Image
                    src={logo}
                    alt="logo"
                    width={48}
                    height={48}
                    sizes="100vw"
                    placeholder='blur'
                    className="object-contain"
                />
                <h1>Jamarski klub Novo mesto</h1>
            </Link>
        </div>
        <div className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
            <Input
                className='w-full flex-1 md:w-auto md:flex-none'
                type="text"
                placeholder="Search ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
            {editable && signedIn && <Button asChild size="icon" variant="outline">
                <Link
                    /* $path({
                            route: "/edit/[articleUrl]",
                            routeParams: { articleUrl: sanitized_url }
                        }) */
                    href={`/edit/${sanitized_url}`}
                    className='h-fill'
                >
                    <Pencil1Icon className="h-[1.2rem] w-[1.2rem]" />
                </Link>
            </Button>}
            {signedIn && <Button
                size="icon"
                variant="outline"
                onClick={async () => {
                    const response = await new_article({})

                    if (typeof response.serverError == "undefined" && response.data)
                        router.push(`/edit/${response.data.url}`)
                }}
            >
                <PlusIcon className="h-[1.2rem] w-[1.2rem]" />
            </Button>}
            <ModeToggle />
            {user ? <UserNav user={user} /> : null }
        </div>
    </>
}

function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                    variant="ghost"
                >
                    Nav
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you're done.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input articleId="name" value="Pedro Duarte" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input articleId="username" value="@peduarte" className="col-span-3" />
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit">Save changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

function Footer() {
    return <>
        Footer
    </>
}

type UserNavProps = {
    user: TrimmedUser
} & HTMLProps<HTMLButtonElement>

function UserNav({ className, user }: UserNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={twMerge("relative h-8 w-8 rounded-full", className)}
                >
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatars/03.png" alt={`user logo: ${user.name}`} />
                        <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">shadcn</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            m@example.com
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        Profile
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Billing
                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Settings
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>New Team</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    Log out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
