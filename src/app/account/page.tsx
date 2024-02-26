"use client"

import { Button, Container } from "@mantine/core"
import { signIn, signOut, useSession } from "next-auth/react"

export default function Account() {
    const session = useSession()

    return (
        <Container>
            {session.status == "unauthenticated" ? <Button onClick={() => signIn("google", { callbackUrl: "/" })}>Sign in</Button> : null}
            {session.status == "authenticated" ? <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button> : null}
            <pre className="break-all min-w-0">
                {JSON.stringify(session, null, 2)}
            </pre>
        </Container>
    )
}