import { compile } from '@mdx-js/mdx'

export default async function compileMDXOnServer(source: string) {
    const code = String(await compile('# hi', {
        outputFormat: 'function-body',
    }))

    return code
}