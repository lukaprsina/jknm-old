"use client";

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
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { twMerge } from 'tailwind-merge';
import { signOut } from 'next-auth/react';

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
    return (
        <div className="flex flex-col h-screen justify-between">
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
            <main className="h-full w-full">
                {children}
            </main>
            {/* TODO: fix this god awful styles */}
            <footer /* className="py-6 md:px-8 md:py-0" */>
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <Footer />
                </div>
            </footer>
        </div>
    )
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
                    href={`/uredi/${sanitized_url}`}
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

                    if (typeof response.serverError == "undefined" && typeof response.validationErrors == "undefined" && response.data)
                        router.push(`/uredi/${response.data.url}`)
                }}
            >
                <PlusIcon className="h-[1.2rem] w-[1.2rem]" />
            </Button>}
            <ModeToggle />
            {user ? <UserNav user={user} /> : null}
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
                        <Input value="Pedro Duarte" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input value="@peduarte" className="col-span-3" />
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
        <Button asChild variant="link">
            <Link href="/racun">Račun</Link>
        </Button>
    </>
}

type UserNavProps = {
    user: TrimmedUser
} & HTMLProps<HTMLButtonElement>

function UserNav({ className, user }: UserNavProps) {
    const initials = useMemo(() => user?.name?.split(" ").map((n) => n[0]).join(""), [user?.name])
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={twMerge("relative h-8 w-8 rounded-full", className)}
                >
                    <Avatar className="h-9 w-9">
                        {user.image ?
                            <AvatarImage src={user.image} alt={user.name ? `user logo: ${user.name}` : "user logo"} /> :
                            <AvatarFallback>{initials}</AvatarFallback>
                        }
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                {user.name ? <>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            {user.email ? (
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            ) : null}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                </> : null}
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/racun">
                            Nastavitve
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={async () => {
                        await signOut()
                        router.push("/racun")
                    }}
                >
                    Zamenjaj račun
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    Odjavi se
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
