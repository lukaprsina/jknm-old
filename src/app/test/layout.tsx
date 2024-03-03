import { getServerSession } from "next-auth";
import ResponsiveShell from "~/components/responsive_shell";

export default async function MdxLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  return (
    <ResponsiveShell user={session?.user}>
      <div className="prose xl:prose-xl dark:prose-invert container">
        {children}
      </div>
    </ResponsiveShell>
  )
}