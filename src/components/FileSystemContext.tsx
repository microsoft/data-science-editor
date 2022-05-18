import React, { createContext, ReactNode, useContext, useMemo } from "react"
import { fileSystemHandleSupported } from "./fs/fs"
import { FileSystem, FileSystemDirectory } from "./fs/fsdom"

export interface FileSystemProps {
    fileSystem: FileSystem
    showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<void>
}

export const FileSystemContext = createContext<FileSystemProps>({
    fileSystem: undefined,
    showDirectoryPicker: undefined,
})
FileSystemContext.displayName = "fs"

export default function useFileSystem(): FileSystemProps {
    const ctx = useContext(FileSystemContext)
    return ctx
}

// eslint-disable-next-line react/prop-types
export function FileSystemProvider(props: { children: ReactNode }) {
    const { children } = props
    const fileSystem = useMemo(
        () => (fileSystemHandleSupported() ? new FileSystem() : undefined),
        []
    )
    const supported = !!fileSystem
    const showDirectoryPicker = supported
        ? async (options?: DirectoryPickerOptions) => {
              try {
                  const handle = await window.showDirectoryPicker(options)
                  if (handle !== fileSystem.root?.handle)
                      fileSystem.root = new FileSystemDirectory(this, handle)
              } catch (e) {
                  console.debug(e)
              }
          }
        : undefined

    return (
        <FileSystemContext.Provider
            value={{
                fileSystem,
                showDirectoryPicker,
            }}
        >
            {children}
        </FileSystemContext.Provider>
    )
}
