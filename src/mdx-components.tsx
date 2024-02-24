import type { MDXComponents } from 'mdx/types'

export const custom_mdx_components: MDXComponents = {
    "img": ({ src, alt, title }) => (
        <figure>
            {/* eslint-disable-next-line @next/next/no-img-element*/}
            <img src={src} alt={alt} />
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