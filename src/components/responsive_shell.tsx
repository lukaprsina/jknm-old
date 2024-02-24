"use client";

import Image from 'next/image';
import logo from '~/content/logo.png'
import { type new_article as new_article_type } from '../app/actions'
import Link from 'next/link';
import { Pencil1Icon, PlusIcon } from "@radix-ui/react-icons"
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { remove_article_prefix } from '~/lib/fs';
import { ModeToggle } from './mode_toggle';
import { Button } from './ui/button';
import { Input } from './ui/input';

type ResponsiveShellProps = {
    children: React.ReactNode
    new_article: typeof new_article_type
}

export default function ResponsiveShell({ children, new_article }: ResponsiveShellProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [searchText, setSearchText] = useState('');

    const sanitized_url = useMemo(() => remove_article_prefix(pathname), [pathname])

    // https://github.dev/shadcn-ui/ui/tree/main/apps/www/components/site-header.tsx
    return <>
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="relative h-full flex mr-4">
                    <Image
                        src={logo}
                        alt="logo"
                        width={48}
                        height={48}
                        sizes="100vw"
                        placeholder='blur'
                        className="object-contain"
                    />
                </div>
                <div className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
                    <Input
                        className='w-52'
                        type="text"
                        placeholder="Search ..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button asChild>
                        <Link
                            href={{
                                pathname: '/edit',
                                query: { url: sanitized_url },
                            }}
                            className='h-fill'
                        >
                            <Pencil1Icon className="h-[1.2rem] w-[1.2rem]" />
                        </Link>
                    </Button>
                    <Button>
                        <PlusIcon className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                    <ModeToggle />
                </div>
            </div>
        </nav>
        <main className="prose lg:prose-xl container mt-4">
            {children}
        </main>
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
                        <Group ml={50} gap={5}>
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
