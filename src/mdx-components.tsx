import type { MDXComponents } from 'mdx/types'
import { type StaticImport } from 'next/dist/shared/lib/get-img-props'
import NextImage from 'next/image'
import Link from 'next/link'

type ImageProps = {
    src: StaticImport
    alt?: string
    caption?: string
}

export const custom_mdx_components: MDXComponents = {
    "img": ({ src, alt, title }) => (
        <figure>
            {/* eslint-disable-next-line @next/next/no-img-element*/}
            <img src={src} alt={alt} />
            <figcaption>{title}</figcaption>
        </figure>
    ),
    "a": ({ href, children, ...props }) => (
        <Link href={href ?? ""} {...props}>{children}</Link>
    ),
    "Image": ({ src, alt, caption }: ImageProps) => (
        <figure>
            <NextImage placeholder='blur' src={src} alt={alt ?? ""} />
            <figcaption>{caption}</figcaption>
        </figure>
    )
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...custom_mdx_components,
        ...components,
    }
}