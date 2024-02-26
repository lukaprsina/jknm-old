"use client"

import { signOut, useSession } from "next-auth/react"
import { UserAuthForm } from "~/app/account/auth_form"

export default function Account() {
    const { data: session } = useSession()

    return (
        <div className="prose lg:prose-xl dark:prose-invert min-w-full w-full">
            {session ? <Profile /> : <SignIn />}
        </div>
    )
}

function Profile() {
    return (
        <div>
            <h1>Profile</h1>
            <button onClick={() => signOut()}>Sign out</button>
        </div>
    )
}

function SignIn() {
    return (
        <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    Jamarski klub Novo mesto
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Prijava
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Vnesi email ali se prijavi preko družbenih omrežij
                        </p>
                    </div>
                    <UserAuthForm />
                </div>
            </div>
        </div>
    )
}