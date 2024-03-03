import type { MDXComponents } from 'mdx/types'
import NextImage, { ImageProps } from 'next/image'

export const custom_mdx_components: MDXComponents = {
    "img": ({ src, alt, title }) => (
        <figure>
            {/* eslint-disable-next-line @next/next/no-img-element*/}
            <img src={src} alt={alt} />
            <figcaption>{title}</figcaption>
        </figure>
    ),
    "Image": ({ src, alt, title }: ImageProps) => (
        <figure>
            <NextImage placeholder='blur' src={src} alt={alt} />
            <figcaption>{title}</figcaption>
        </figure>
    )
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...custom_mdx_components,
        ...components,
    }
}