"use client";

import { AppShell, Autocomplete, Burger, Button, Group, px, rem, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Image from 'next/image';
import Link from 'next/link';
import logo from '~/content/logo.png'
import { IconEdit, IconPlus, IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import path from 'path';
import { search_articles, type new_article as new_type } from './actions'

export default function ResponsiveShell({ children, new_article }: { children: React.ReactNode, new_article: typeof new_type }) {
    const [opened, { toggle }] = useDisclosure(false);
    const pathname = usePathname()
    const router = useRouter()
    const { breakpoints } = useMantineTheme();
    const isXS = useMediaQuery(`(max-width: ${px(breakpoints.xs)}px)`);
    const [searchText, setSearchText] = useState('');

    const sanitized_pathname = useMemo<string>(() => {
        if (pathname.startsWith("/"))
            return pathname.slice(1)
        else return pathname
    }, [pathname])

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
                                    query: { pathname: sanitized_pathname },
                                }}
                            >
                                <IconEdit />
                            </Link>
                            <Button variant='transparent' color='black'
                                onClick={async () => {
                                    const response = await new_article({ pathname: path.dirname(sanitized_pathname) })
                                    console.log(response)

                                    if (response.data)
                                        router.push(`/edit?pathname=${response.data.pathname}`)
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
}
