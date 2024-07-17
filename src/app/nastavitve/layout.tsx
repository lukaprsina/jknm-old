import { Metadata } from "next";

import { Separator } from "~/components/ui/separator";
import { SidebarNav } from "./sidebar_nav";
import ResponsiveShell from "~/components/responsive_shell";
import { getServerAuthSession } from "~/server/auth";

export const metadata: Metadata = {
  title: "Profil",
};

const sidebarNavItems = [
  {
    title: "Profil",
    href: "/nastavitve/profil",
  },
  {
    title: "Novičke",
    href: "/nastavitve/novice",
  },
  {
    title: "Dostop",
    href: "/nastavitve/dostop",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsLayout({
  children,
}: SettingsLayoutProps) {
  const session = await getServerAuthSession();
  const name = session?.user.name?.split(" ")[0];

  return (
    <ResponsiveShell user={session?.user}>
      <div className="container prose-lg pt-10 dark:prose-invert md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            {session ? `Živjo, ${name}! 👋` : "Moj Profil"}
          </h2>
          <p className="text-muted-foreground">
            Upravljaj svoj račun in novičke
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
    </ResponsiveShell>
  );
}
