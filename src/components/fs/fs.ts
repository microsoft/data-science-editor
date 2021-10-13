import { inIFrame } from "../../../jacdac-ts/src/jdom/iframeclient"
import { SMap } from "../../../jacdac-ts/src/jdom/utils"
import { UIFlags } from "../../jacdac/providerbus"

export function fileSystemHandleSupported() {
    return (
        typeof window !== "undefined" &&
        !!window.showDirectoryPicker &&
        !inIFrame() &&
        !UIFlags.hosted
    )
}

export async function writeFileText(
    fileHandle: FileSystemFileHandle,
    content: string
) {
    const file = await fileHandle.createWritable({
        keepExistingData: false,
    })
    try {
        await file.write(content)
    } finally {
        try {
            await file.close()
        } catch (e) {
            console.debug(`file close error`, { e })
        }
    }
}

export async function readFileText(fileHandle: FileSystemFileHandle) {
    const file = await fileHandle.getFile()
    try {
        return await file.text()
    } catch (e) {
        console.debug(`file read error`, { e })
        return undefined
    }
}

export async function listDirectories(directory: FileSystemDirectoryHandle) {
    const values = directory?.values()
    const r: FileSystemDirectoryHandle[] = []
    if (values)
        for await (const entry of values) {
            if (entry.kind === "directory") r.push(entry)
        }
    return r
}

export async function listFiles(
    directory: FileSystemDirectoryHandle,
    extension?: string
) {
    const values = directory?.values()
    let r: FileSystemFileHandle[] = []
    if (values)
        for await (const entry of values) {
            if (entry.kind === "file") r.push(entry)
        }
    if (extension) r = r.filter(f => f.name.endsWith(extension))
    return r
}

export async function fileOpen(
    options: {
        mimeTypes?: SMap<string[]>
        extensions?: string
        description?: string
        multiple?: boolean
    } = {}
): Promise<FileSystemFileHandle[]> {
    const accept = {}
    if (options.mimeTypes) {
        Object.keys(options.mimeTypes).map(mimeType => {
            accept[mimeType] = options.mimeTypes[mimeType]
        })
    } else {
        accept["*/*"] = options.extensions || []
    }
    const files = await window.showOpenFilePicker({
        types: [
            {
                description: options.description || "",
                accept: accept,
            },
        ],
        multiple: options.multiple || false,
        excludeAcceptAllOption: true,
    })
    console.debug(`open file picker`, { files })
    return files
}

export async function importFiles(
    directory: FileSystemDirectoryHandle,
    files: FileSystemFileHandle[]
) {
    if (!directory || !files?.length) return

    for (const file of files) {
        console.debug(`importing ${file.name} -> ${directory.name}`)
        const content = await readFileText(file)
        const to = await directory.getFileHandle(file.name, {
            create: true,
        })
        await writeFileText(to, content)
    }
}

export async function importCSVFilesIntoWorkspace(
    directory: FileSystemDirectoryHandle
) {
    const files = await fileOpen({
        multiple: true,
        mimeTypes: { ["text/csv"]: [".csv"] },
    })
    await importFiles(directory, files)
}

export async function importModelJSONIntoWorkspace(
    directory: FileSystemDirectoryHandle
) {
    const files = await fileOpen({
        multiple: true,
        mimeTypes: { ["text/json"]: [".json"] },
    })
    await importFiles(directory, files)
}
