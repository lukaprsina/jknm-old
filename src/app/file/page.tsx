import fs from "fs/promises"
import path from "path"
import { Paper, Flex } from '@mantine/core';

export type File = {
    name: string
    size: number
    lastModified: Date
}

export type Directory = {
    name: string
    files: File[]
    directories: Directory[]
}

const FILESYSTEM_ROOT = "./public/fs"

async function getDirectory(input_path: string | undefined) {
    const dir = path.resolve(path.join(FILESYSTEM_ROOT, input_path ?? "./"))
    const directory: Directory = {
        // TODO
        name: dir,
        files: [],
        directories: []
    }

    const file_names = await fs.readdir(dir)

    for (const file_name of file_names) {
        const file_path = path.join(dir, file_name)
        const stats = await fs.stat(file_path)
        if (stats.isFile()) {
            directory.files.push({
                name: file_name,
                size: stats.size,
                lastModified: stats.mtime,
            })
        } else if (stats.isDirectory()) {
            directory.directories.push({
                name: file_name,
                files: [],
                directories: []
            })
        }
    };

    return directory
}

export default async function File() {
    const directory = await getDirectory(undefined);
    return (
        <Flex
            style={{ width: "100%", height: "100%" }}
        >
            <Paper
                style={{ minWidth: "100px", height: "100%" }}
            >
                Navbar
            </Paper>
            <Paper
                style={{ minWidth: "300px", height: "100%" }}
            >
                <ul>
                    {directory.directories.map((directory) => (
                        <Paper
                            key={directory.name}
                            shadow="xs"
                        >
                            {directory.name}
                        </Paper>
                    ))}
                    {directory.files.map((file) => (
                        <Preview key={file.name} name={file.name} />
                    ))}
                </ul>
            </Paper>
        </Flex>
    )
}

type PreviewProps = {
    name: string
}

function Preview({ name }: PreviewProps) {
    return (
        <Paper
            key={name}
            shadow="xs"
        >

        </Paper>
    )
}