import "./src/env.js"
import nextMDX from '@next/mdx'

const withMDX = nextMDX({
    extension: /\.(md|mdx)$/,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure `pageExtensions` to include MDX files
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
    experimental: {
        mdxRs: true
    }
}

export default withMDX(nextConfig)