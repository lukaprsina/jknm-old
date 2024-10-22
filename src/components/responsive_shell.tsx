"use client";

import {
  new_article,
  type new_article as new_article_type,
} from "../server/articles";
import Link from "next/link";
import {
  HamburgerMenuIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { usePathname, useRouter } from "next/navigation";
import { HTMLProps, useMemo } from "react";
import { remove_article_prefix } from "~/lib/fs";
import { ModeToggle } from "../app/mode_toggle";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { twMerge } from "tailwind-merge";
import { signOut, useSession } from "next-auth/react";
import { DesktopNavMenu } from "./nav_menu";
import Image from "next/image";
import logo from "~/content/logo.png";
import { NoviceAutocomplete } from "./autocomplete";

type TrimmedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}; // user, but omit emailVerified

type ResponsiveShellProps = {
  children: React.ReactNode;
  editable?: boolean;
  user?: TrimmedUser;
};

export default function ResponsiveShell({
  user,
  editable,
  children,
}: ResponsiveShellProps) {
  const pathname = usePathname();

  const sanitized_url = useMemo(
    () => remove_article_prefix(pathname),
    [pathname],
  );

  // https://github.dev/shadcn-ui/ui/tree/main/apps/www/components/site-header.tsx
  return (
    <div className="relative -z-20 h-full min-h-screen justify-between">
      <header className="top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <MobileSideNav />
          <MainNav
            signedIn={!!user}
            editable={editable ?? false}
            new_article={new_article}
            sanitized_url={sanitized_url}
            user={user}
          />
        </div>
      </header>
      <main className="relative -z-10 h-full min-h-screen w-full">
        {children}
      </main>
      <footer className="bottom-0 z-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <Footer />
        </div>
      </footer>
    </div>
  );
}

type MainNavProps = {
  editable: boolean;
  signedIn: boolean;
  new_article: typeof new_article_type;
  sanitized_url: string;
  user?: TrimmedUser;
};

function MainNav({
  editable,
  signedIn,
  new_article,
  sanitized_url,
  user,
}: MainNavProps) {
  const router = useRouter();

  return (
    <div className="flex w-full justify-end lg:justify-between">
      <div className="mr-4 hidden h-full items-center gap-4 lg:flex">
        <Link href="/" className="flex h-full w-14">
          <Image
            src={logo}
            alt="logo"
            sizes="100vw"
            placeholder="empty"
            className="mr-2 h-auto scale-75 object-contain"
          />
        </Link>
        <DesktopNavMenu />
      </div>
      <div className="flex items-center justify-between space-x-2 [--aa-background-color-rgb:0,200,200]">
        <NoviceAutocomplete />
        {editable && signedIn && (
          <Button asChild size="icon" variant="outline">
            <Link href={`/uredi/${sanitized_url}`} className="h-fill">
              <Pencil1Icon className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </Button>
        )}
        {signedIn && (
          <Button
            size="icon"
            variant="outline"
            onClick={async () => {
              const response = await new_article({});

              if (
                response &&
                typeof response.serverError == "undefined" &&
                typeof response.validationErrors == "undefined" &&
                response.data
              )
                router.push(`/uredi/${response.data.url}`);
            }}
          >
            <PlusIcon className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        )}
        <ModeToggle />
        {user ? <UserNav user={user} /> : null}
      </div>
    </div>
  );
}

function MobileSideNav() {
  const session = useSession();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          variant="ghost"
        >
          Nav
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="mt-16 flex items-center">
          <SheetTitle>Jamarski klub Novo mesto</SheetTitle>
        </SheetHeader>
        <div className="flex h-full w-full flex-col justify-center space-y-4">
          <Button asChild variant="link">
            <Link href="/">Domov</Link>
          </Button>
          <Button asChild variant="link">
            {session.status !== "authenticated" ? (
              <Link href="/prijava">Prijava</Link>
            ) : null}
          </Button>
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Footer() {
  const session = useSession();

  return (
    <>
      <Button asChild variant="link">
        {session.status !== "authenticated" ? (
          <Link href="/prijava">Prijava</Link>
        ) : null}
      </Button>
    </>
  );
}

type UserNavProps = {
  user?: TrimmedUser;
  buttons?: boolean;
} & HTMLProps<HTMLButtonElement>;

function UserNav({ className, user, buttons }: UserNavProps) {
  const initials = useMemo(
    () =>
      user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join(""),
    [user?.name],
  );
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={twMerge("relative h-8 w-8 rounded-full", className)}
        >
          <Avatar className="h-9 w-9 bg-primary/20">
            {user?.image ? (
              <AvatarImage
                src={user.image}
                alt={user.name ? `user logo: ${user.name}` : "user logo"}
              />
            ) : (
              <>
                {buttons ? (
                  <HamburgerMenuIcon className="flex h-8 w-8 items-center justify-center" />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {user?.name ? (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                {user.email ? (
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          Odjavi se
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
