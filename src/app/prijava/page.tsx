"use client";

import { signIn, useSession } from "next-auth/react";
import { Skeleton } from "~/components/ui/skeleton";
import ResponsiveShell from "../../components/responsive_shell";
import Image from "next/image";
import logo from "~/content/logo.png";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";

export default function Prijava() {
  const { data, status } = useSession();

  return (
    <ResponsiveShell user={data?.user}>
      <div className="prose h-screen w-full min-w-full dark:prose-invert lg:prose-xl">
        {status == "loading" ? <EditorSkeleton /> : <SignIn />}
      </div>
    </ResponsiveShell>
  );
}

function SignIn() {
  const isLoading = false;

  return (
    <div className="relative hidden h-full min-h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="dark:border-r> relative hidden h-full flex-col justify-center bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="z-10 flex items-center justify-center text-lg font-medium">
          <Image
            src={logo}
            alt="logo"
            sizes="100vw"
            placeholder="blur"
            className="w-1/2"
          />
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Prijava</h1>
            <p className="text-sm text-muted-foreground">
              Prijavi se z Google računom (domena mora biti jknm.si)
            </p>
          </div>
          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            variant="outline"
            type="button"
            disabled={isLoading}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}{" "}
            Google
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
