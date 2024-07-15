import ResponsiveShell from "~/components/responsive_shell";
import { Search } from "./search";
import { getServerAuthSession } from "~/server/auth";

// https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/#app-router-experimental
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getServerAuthSession();

  return (
    <ResponsiveShell editable={true} user={session?.user}>
      <div className="container pt-10">
        <Search />
      </div>
    </ResponsiveShell>
  );
}
