"use client"

import { Button } from "@mantine/core"
import { new_article, save_article } from "../actions"

export default function Page() {
    return <>
        <Button
            onClick={async () => {
                await new_article({
                    article_path: "/test/a/b"
                })
            }}>
            New article
        </Button>
        <Button
            onClick={async () => {
                await save_article({
                    pathname: "test4/a/b",
                    title: "test title 2",
                    id: 116,
                })
            }}>
            Save article
        </Button>
    </>
}
