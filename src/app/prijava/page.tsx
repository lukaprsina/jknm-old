"use client"

import { useSession } from "next-auth/react"
import { SignInForm } from "./signin_form"
import { Skeleton } from "~/components/ui/skeleton"
import ResponsiveShell from "../../components/responsive_shell"
import Image from "next/image"
import logo from '~/content/logo.png'

export default function Prijava() {
    const { data, status } = useSession()
    // const router = useRouter()

    // TODO
    /* if (status == "authenticated")
        router.push("/racun") */

    return (
        <ResponsiveShell user={data?.user}>
            <div className="prose lg:prose-xl dark:prose-invert min-w-full w-full h-screen">
                {status == "loading" ? <EditorSkeleton /> : <SignIn />}
            </div>
        </ResponsiveShell>
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
                    <SignInForm />
                </div>
            </div>
        </div>
    )
}

function EditorSkeleton() {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    )
}