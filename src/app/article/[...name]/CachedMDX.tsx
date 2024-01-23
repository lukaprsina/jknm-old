"use client"

import { run } from "@mdx-js/mdx"
import { Fragment, useEffect, useState } from "react"
import * as runtime from 'react/jsx-runtime'

type CachedMDXProps = {
    content: string
}

function CachedMDX({ content }: CachedMDXProps) {
    const [Component, setComponent] = useState<JSX.Element>()

    useEffect(() => {
        async function get_content() {
            const { default: MDXComponent } = await run(content, {
                ...runtime,
                Fragment
            })
            setComponent(<MDXComponent />)
        }

        void get_content()
    }, [])

    return <>{Component}</>
}

export default CachedMDX