"use client"

import ResponsiveShell from "~/app/responsive_shell"

export default function Error() {
    return (
        <ResponsiveShell>
            <div className="prose lg:prose-lg dark:prose-invert container">
                <h1>Article not found</h1>
                <p>Sorry, the article you are looking for could not be found. error.tsx</p>
            </div>
        </ResponsiveShell>
    )
}