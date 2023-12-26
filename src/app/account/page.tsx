"use client"

import { signIn } from "next-auth/react"

export default function Account() {
    return (
        <button onClick={() => signIn("google")}>Login</button>
    )
}