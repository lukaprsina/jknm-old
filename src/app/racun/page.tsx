"use client"

import { signOut, useSession } from "next-auth/react"
import { UserAuthForm } from "~/app/racun/auth_form"
import { Skeleton } from "~/components/ui/skeleton"
import ResponsiveShell from "../../components/responsive_shell"
import { Button } from "~/components/ui/button"
import Image from "next/image"
import logo from '~/content/logo.png'

export default function Account() {
    const { data, status } = useSession()

    return (
        <ResponsiveShell user={data?.user}>
            <div className="prose lg:prose-xl dark:prose-invert min-w-full w-full h-full">
                {status == "loading" ? (
                    <EditorSkeleton />
                ) : <>
                    {status == "authenticated" ? <Profile /> : <SignIn />}
                </>}
            </div>
        </ResponsiveShell>
    )
}

function Profile() {
    return (
        <div className="container">
            <h1>Nastavitve</h1>
            <Button onClick={() => signOut()}>
                Sign out
            </Button>
        </div>
    )
}

function SignIn() {
    return (
        <div className="relative hidden h-full min-h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r> justify-center">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="z-20 flex items-center text-lg font-medium justify-center">
                    <Image
                        src={logo}
                        alt="logo"
                        sizes="100vw"
                        placeholder='blur'
                        className="w-1/2"
                    />
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

function EditorSkeleton() {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    )
}