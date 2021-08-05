import { CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { JDEventSource } from "../../../jacdac-ts/src/jdom/eventsource"
import { readFileText, writeFileText } from "./fs"

export class FileSystem extends JDEventSource {
    private _root: FileSystemDirectory
    private _workingDirectory: FileSystemDirectory

    constructor() {
        super()
    }

    get root(): FileSystemDirectory {
        return this._root
    }
    set root(d: FileSystemDirectory) {
        if (d !== this._root) {
            this._root = d
            this._workingDirectory = undefined
            this.emit(CHANGE)
        }
    }

    get workingDirectory(): FileSystemDirectory {
        return this._workingDirectory
    }
    set workingDirectory(d: FileSystemDirectory) {
        if (d !== this._workingDirectory) {
            this._workingDirectory = d
            this.emit(CHANGE)
        }
    }

    async createWorkingDirectory(
        name: string,
        filename?: string,
        content?: string
    ): Promise<void> {
        const handle = await this.root.handle.getDirectoryHandle(name, {
            create: true,
        })
        if (filename) {
            const fileHandle = await handle.getFileHandle(filename, {
                create: true,
            })
            await writeFileText(fileHandle, content)
        }
        await this.root.sync()
        this.workingDirectory = this.root.directories.find(d => d.name === name)
    }
}

export class FileSystemFile extends JDEventSource {
    private _text: string

    constructor(public handle: FileSystemFileHandle) {
        super()
    }

    get name() {
        return this.handle.name
    }

    get text() {
        if (this._text === undefined) this.sync()
        return this._text
    }

    async textAsync() {
        await this.sync()
        return this._text
    }

    async write(text: string) {
        await writeFileText(this.handle, text)
        if (this._text !== text) {
            this._text = text
            // don't signal
            // this.emit(CHANGE)
        }
    }

    async sync() {
        const text = await readFileText(this.handle)
        if (text !== this._text) {
            this._text = text
            this.emit(CHANGE)
        }
    }
}

function sortHandles(handles: FileSystemHandle[]) {
    handles.sort((l, r) => l.name.localeCompare(r.name))
    return handles
}

export class FileSystemDirectory extends JDEventSource {
    private _directories: FileSystemDirectory[] = []
    private _files: FileSystemFile[] = []

    constructor(readonly handle: FileSystemDirectoryHandle) {
        super()
        this.sync()
    }

    get name() {
        return this.handle.name
    }

    get directories() {
        return this._directories.slice(0) || []
    }

    get files() {
        return this._files.slice(0) || []
    }

    directory(
        name: string,
        options?: { create?: boolean }
    ): FileSystemDirectory {
        const existing = this._directories.find(f => f.name === name)
        if (existing) return existing

        if (options?.create) {
            // create file in the background
            this.handle
                .getDirectoryHandle(name, {
                    create: true,
                })
                .then(nf => {
                    const nfn = new FileSystemDirectory(nf)
                    this._directories.push(nfn)
                    this._directories.sort((l, r) =>
                        l.name.localeCompare(r.name)
                    )
                    this.emit(CHANGE)
                })
        }

        // no file yet
        return undefined
    }

    file(name: string, options?: { create?: boolean }): FileSystemFile {
        const existing = this._files.find(f => f.name === name)
        if (existing) return existing

        if (options?.create) {
            // create file in the background
            this.handle
                .getFileHandle(name, {
                    create: true,
                })
                .then(nf => {
                    const nfn = new FileSystemFile(nf)
                    this._files.push(nfn)
                    this._files.sort((l, r) => l.name.localeCompare(r.name))
                    this.emit(CHANGE)
                })
        }

        // no file yet
        return undefined
    }

    async sync() {
        const values = this.handle.values()
        const files: FileSystemFileHandle[] = []
        const directories: FileSystemDirectoryHandle[] = []
        if (values)
            for await (const entry of values) {
                if (entry.kind === "directory")
                    directories.push(entry as FileSystemDirectoryHandle)
                else if (entry.kind === "file")
                    files.push(entry as FileSystemFileHandle)
            }
        sortHandles(files)
        sortHandles(directories)
        // did the files change?
        let changed = false
        if (
            this._files.map(f => f.name).join() !==
            files.map(f => f.name).join()
        ) {
            // some of the file changed
            const patched = files.map(f => {
                const oldf = this._files.find(oldf => oldf.name === f.name)
                return oldf || new FileSystemFile(f)
            })
            this._files = patched
            changed = true
        }

        if (
            this._directories.map(f => f.name).join() !==
            directories.map(f => f.name).join()
        ) {
            // some of the file changed
            const patched = directories.map(f => {
                const oldf = this._directories.find(
                    oldf => oldf.name === f.name
                )
                return oldf || new FileSystemDirectory(f)
            })
            this._directories = patched
            changed = true
        }

        if (changed) this.emit(CHANGE)
    }
}
