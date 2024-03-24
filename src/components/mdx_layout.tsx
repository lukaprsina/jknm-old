import ResponsiveShell from "~/components/responsive_shell";
import { getServerAuthSession } from "~/server/auth";

export default async function MdxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <ResponsiveShell user={session?.user}>
      <div className="container prose mt-12 dark:prose-invert xl:prose-xl">
        {children}
      </div>
    </ResponsiveShell>
  );
}
