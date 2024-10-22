"use client";

import ResponsiveShell from "~/components/responsive_shell";

export default function Error() {
  return (
    <ResponsiveShell>
      <div className="container prose pt-4 dark:prose-invert lg:prose-lg">
        <h1>Article not found</h1>
        <p>
          Sorry, the article you are looking for could not be found. error.tsx
        </p>
      </div>
    </ResponsiveShell>
  );
}
