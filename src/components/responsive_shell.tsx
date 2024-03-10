"use client";

import { new_article, type new_article as new_article_type } from '../server/data_layer/articles'
import Link from 'next/link';
import { HamburgerMenuIcon, MagnifyingGlassIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons"
import { usePathname, useRouter } from 'next/navigation';
import { HTMLProps, useMemo, useState } from 'react';
import { remove_article_prefix } from '~/lib/fs';
import { ModeToggle } from '../app/mode_toggle';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "./ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { twMerge } from 'tailwind-merge';
import { signOut, useSession } from 'next-auth/react';
import { DesktopNavMenu } from './nav_menu';
import Image from 'next/image';
import logo from '~/content/logo.png'
import useLog from '~/hooks/use_log';

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
        <div className="min-h-screen h-full justify-between relative -z-20">
            <header className="top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            </header>
            <main className="min-h-screen h-full w-full relative -z-10">
                {children}
            </main>
            <footer className="bottom-0 z-10">
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

    return (
        <div className="flex justify-between w-full">
            <div className="mr-4 hidden lg:flex items-center h-full gap-4">
                <Link href="/" className="flex h-full w-14">
                    <Image
                        src={logo}
                        alt="logo"
                        sizes="100vw"
                        placeholder='blur'
                        className="object-contain h-auto mr-2"
                    />
                </Link>
                <DesktopNavMenu />
            </div>
            <div className='flex flex-1 items-center justify-between space-x-2 lg:justify-end'            >
                <Input
                    className='block lg:hidden navbar:block w-full ml-5 flex-1 lg:w-auto lg:flex-none'
                    type="text"
                    placeholder="Search ..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Button size="icon" variant="outline" className='hidden lg:flex navbar:hidden'>
                    <MagnifyingGlassIcon className="h-[1.2rem] w-[1.2rem]" />
                </Button>
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
        </div>
    )
}

function MobileNav() {
    const session = useSession()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
                    variant="ghost"
                >
                    Nav
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader className="flex items-center mt-16">
                    <SheetTitle>Jamarski klub Novo mesto</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col w-full h-full space-y-4 justify-center">
                    <Button asChild variant="link">
                        <Link href="/">Domov</Link>
                    </Button>
                    <Button asChild variant="link">
                        {session.status == "authenticated" ? (
                            <Link href="/racun">Račun</Link>
                        ) : (
                            <Link href="/prijava">Prijava</Link>
                        )}
                    </Button>
                </div>
                <SheetFooter>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

function Footer() {
    const session = useSession()

    return <>
        <Button asChild variant="link">
            {session.status == "authenticated" ? (
                <Link href="/racun">Račun</Link>
            ) : (
                <Link href="/prijava">Prijava</Link>
            )}
        </Button>
    </>
}

type UserNavProps = {
    user?: TrimmedUser
    buttons?: boolean
} & HTMLProps<HTMLButtonElement>

function UserNav({ className, user, buttons }: UserNavProps) {
    const initials = useMemo(() => user?.name?.split(" ").map((n) => n[0]).join(""), [user?.name])
    const router = useRouter()
    useLog(user?.image, "current user")

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={twMerge("relative h-8 w-8 rounded-full", className)}
                >
                    <Avatar className="h-9 w-9 bg-primary/20">
                        {user?.image ?
                            <AvatarImage
                                src={user.image}
                                alt={user.name ? `user logo: ${user.name}` : "user logo"}
                                onError={(e) => {
                                    console.error("Error loading image", e)
                                }}
                            /> : <>
                                {buttons ? (
                                    <HamburgerMenuIcon className="h-8 w-8 flex items-center justify-center" />
                                ) : (
                                    <AvatarFallback>{initials}</AvatarFallback>
                                )}
                            </>
                        }
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                {user?.name ? <>
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
                            Profil
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={async () => {
                        await signOut()
                        router.push("/prijava")
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
