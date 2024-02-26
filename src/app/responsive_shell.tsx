"use client";

import Image from 'next/image';
import logo from '~/content/logo.png'
import { new_article, type new_article as new_article_type } from './actions'
import Link from 'next/link';
import { Pencil1Icon, PlusIcon } from "@radix-ui/react-icons"
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { remove_article_prefix } from '~/lib/fs';
import { ModeToggle } from './mode_toggle';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Label } from '../components/ui/label';
import type { User } from '@prisma/client';

type ResponsiveShellProps = {
    children: React.ReactNode
    editable?: boolean
    user?: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    } // user, but omit emailVerified
}

export default function ResponsiveShell({ user, editable, children }: ResponsiveShellProps) {
    const pathname = usePathname()
    const [searchText, setSearchText] = useState('');

    const sanitized_url = useMemo(() => remove_article_prefix(pathname), [pathname])

    // https://github.dev/shadcn-ui/ui/tree/main/apps/www/components/site-header.tsx
    return <>
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <MobileNav />
                <MainNav
                    signedIn={typeof user !== "undefined"}
                    editable={editable ?? false}
                    new_article={new_article}
                    sanitized_url={sanitized_url}
                    searchText={searchText}
                    setSearchText={setSearchText}
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
}

function MainNav({ editable, signedIn, new_article, sanitized_url, searchText, setSearchText }: MainNavProps) {
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
                    href={{
                        pathname: '/edit',
                        query: { url: sanitized_url },
                    }}
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
                    console.log(response)

                    if (typeof response.serverError == "undefined" && response.data)
                        router.push(`/edit?url=${response.data.url}`)
                }}
            >
                <PlusIcon className="h-[1.2rem] w-[1.2rem]" />
            </Button>}
            <ModeToggle />
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
                        <Input id="name" value="Pedro Duarte" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input id="username" value="@peduarte" className="col-span-3" />
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

/* export default function ResponsiveShell({ children, new_article }: { children: React.ReactNode, new_article: typeof new_type }) {
    const [opened, { toggle }] = useDisclosure(false);
    const pathname = usePathname()
    const router = useRouter()
    const { breakpoints } = useMantineTheme();
    const isXS = useMediaQuery(`(max-width: ${px(breakpoints.xs)}px)`);
    const [searchText, setSearchText] = useState('');

    const sanitized_url = useMemo(() => remove_article_prefix(pathname), [pathname])

    return (
        <AppShell
            header={{ height: { base: 60, md: 70, lg: 80 } }}
            footer={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Group
                    h="100%"
                    px="md"
                    justify='space-between'
                >
                    <Group h="100%">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Link
                            href="/"
                            style={{ height: '80%' }}
                        >
                            <Image
                                src={logo}
                                alt="logo"
                                priority={true}
                                fill={false}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        </Link>
                    </Group>
                    <Group>
                        <Group ml={50} gap-3={5}>
                            <Link
                                href={{
                                    pathname: '/edit',
                                    query: { url: sanitized_url },
                                }}
                            >
                                <IconEdit />
                            </Link>
                            <Button variant='transparent' color='black'
                                onClick={async () => {
                                    const response = await new_article({})
                                    console.log(response)

                                    if (typeof response.serverError == "undefined" && response.data)
                                        router.push(`/edit?url=${response.data.url}`)
                                }}
                            >
                                <IconPlus />
                            </Button>
                            {
                                (isXS) ? <IconSearch style={{ width: rem(20), height: rem(20) }} /> :
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault()
                                            const articles = await search_articles({ search_text: searchText })
                                            console.log(articles)
                                        }}
                                    >
                                        <Autocomplete
                                            placeholder="Search"
                                            leftSection={<IconSearch style={{ width: rem(20), height: rem(20) }} />}
                                            data={['jazbina']}
                                            visibleFrom="xs"
                                            value={searchText}
                                            onChange={setSearchText}
                                            onSubmit={(value) => {
                                                console.log(value)
                                            }}
                                        />
                                    </form>
                            }
                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Main style={{ height: "100vh" }}>{children}</AppShell.Main>
            <AppShell.Footer p="md">
                <Link href="/account">Account</Link>
            </AppShell.Footer>
        </AppShell>
    );
} */
