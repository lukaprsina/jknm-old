"use client";

import { AppShell, Burger, Flex, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Image from 'next/image';
import Link from 'next/link';
import logo from '~/content/logo.png'
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function ResponsiveShell({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure(true);
    const pathname = usePathname()
    const [hideAsideAndNavbar] = useState(true)

    const sanitized_pathname = useMemo<string>(() => {
        if (pathname.startsWith("/"))
            return pathname.slice(1)
        else return pathname
    }, [pathname])

    return (
        <AppShell
            header={{ height: { base: 60, md: 70, lg: 80 } }}
            aside={{ width: 300, breakpoint: 'md', collapsed: { desktop: hideAsideAndNavbar, mobile: true } }}
            navbar={{
                width: { base: 200, md: 300, lg: 400 },
                breakpoint: 'sm',
                collapsed: { mobile: hideAsideAndNavbar || !opened, desktop: hideAsideAndNavbar },
            }}
            footer={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Group
                    h="100%"
                    px="md"
                    justify='space-between'
                >
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Link
                        href="/"
                        style={{ height: '80%' }}
                    >
                        <Image
                            src={logo}
                            alt="logo"
                            placeholder='empty'
                            fill={false}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </Link>
                    <Flex>
                        <Link
                            href={{
                                pathname: '/edit',
                                query: { pathname: sanitized_pathname, action: "edit" },
                            }}
                        >
                            <IconEdit />
                        </Link>
                        <Link
                            href={{
                                pathname: '/edit',
                                query: { pathname: sanitized_pathname, action: "create" },
                            }}
                        >
                            <IconPlus />
                        </Link>
                    </Flex>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                Navbar
                {Array(15)
                    .fill(0)
                    .map((_, index) => (
                        <Skeleton key={index} h={28} mt="sm" animate={false} />
                    ))}
            </AppShell.Navbar>
            <AppShell.Main style={{ height: "100vh" }}>{children}</AppShell.Main>
            <AppShell.Aside p="md">Aside</AppShell.Aside>
            <AppShell.Footer p="md">
                <Link href="/account">Account</Link>
            </AppShell.Footer>
        </AppShell>
    );
}