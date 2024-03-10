"use client"

import { type HTMLAttributes } from "react"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { signIn } from "next-auth/react"
import { error_map } from "~/lib/error_map"

const formSchema = z.object({
    username: z.string().email().min(2).max(50),
})

const isLoading = false

export function SignInForm({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema, { errorMap: error_map }),
        defaultValues: {
            username: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Email ali uporabniško ime
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="ime@jknm.si"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Prijavi se preko emaila
                    </Button>
                </form>
            </Form >
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Ali
                    </span>
                </div>
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
    )
}
