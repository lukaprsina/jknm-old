import ResponsiveShell from "~/components/responsive_shell";
import { Search } from "./search";
import { getServerAuthSession } from "~/server/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getServerAuthSession();

  return (
    <ResponsiveShell editable={true} user={session?.user}>
      <div className="container prose-lg pt-10 dark:prose-invert">
        <Search />
      </div>
    </ResponsiveShell>
  );
}
