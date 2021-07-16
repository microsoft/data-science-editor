import { useContext, useMemo, useState } from "react"
import { useChangeAsync } from "../../jacdac/useChange"
import DbContext from "../DbContext"

async function verifyPermission(fileHandle: FileSystemHandle) {
    if (!fileHandle) return false

    const options: FileSystemHandlePermissionDescriptor = {
        mode: "readwrite",
    }
    // Check if permission was already granted. If so, return true.
    if ((await fileHandle.queryPermission(options)) === "granted") {
        return true
    }
    // Request permission. If the user grants permission, return true.
    if ((await fileHandle.requestPermission(options)) === "granted") {
        return true
    }
    // The user didn't grant permission, so return false.
    return false
}

export function fileSystemHandleSupported() {
    return typeof window !== "undefined" && !!window.showDirectoryPicker
}

export default function useDirectoryHandle(storageKey: string) {
    const { db } = useContext(DbContext)
    const directories = useMemo(() => db?.directories, [db])
    const [directory, setDirectory] = useState<FileSystemDirectoryHandle>()

    const supported = fileSystemHandleSupported()
    const showDirectoryPicker = supported
        ? async (options?: DirectoryPickerOptions) => {
              try {
                  const dir = await window.showDirectoryPicker(options)
                  if (dir !== directory) directories.set(storageKey, dir)
              } catch (e) {
                  console.debug(e)
              }
          }
        : undefined
    const clearDirectory = () => directories?.set(storageKey, undefined)

    // reload directory from DB
    useChangeAsync(
        directories,
        async _ => {
            let dir = await _?.get(storageKey)
            console.debug(`load directory`, { storageKey, _, dir })
            if (dir) {
                // check permissions
                const perm = await verifyPermission(dir)
                if (!perm) {
                    console.debug(`permission verification failed`)
                    // clear from db
                    _.set(storageKey, undefined)
                    dir = undefined
                }
            }
            if (dir !== directory) setDirectory(dir)
        },
        [storageKey]
    )
    return {
        supported,
        showDirectoryPicker,
        directory,
        clearDirectory,
    }
}
