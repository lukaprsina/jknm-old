import ResponsiveShell from "~/components/responsive_shell";
import { getServerAuthSession } from "~/server/auth";

export default async function MdxLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  return (
    <ResponsiveShell user={session?.user}>
      <div className="prose xl:prose-xl dark:prose-invert container mt-12">
        {children}
      </div>
    </ResponsiveShell>
  )
}