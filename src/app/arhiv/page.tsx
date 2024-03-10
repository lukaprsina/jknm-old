import ResponsiveShell from '~/components/responsive_shell';
import { Search } from './search';
import { getServerAuthSession } from '~/server/auth';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const session = await getServerAuthSession()

    return (
        <ResponsiveShell editable={true} user={session?.user}>
            <div className="pt-10 prose-lg dark:prose-invert container">
                <Search />
            </div>
        </ResponsiveShell>
    )
}