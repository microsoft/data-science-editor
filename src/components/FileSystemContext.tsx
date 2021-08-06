import React, { createContext, ReactNode, useMemo } from "react"
import { fileSystemHandleSupported } from "./fs/fs"
import { FileSystem, FileSystemDirectory } from "./fs/fsdom"

export interface FileSystemProps {
    fileSystem: FileSystem
    showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<void>
}

const FileSystemContext = createContext<FileSystemProps>({
    fileSystem: undefined,
    showDirectoryPicker: undefined,
})
FileSystemContext.displayName = "fs"

export default FileSystemContext

// eslint-disable-next-line react/prop-types
export function FileSystemProvider(props: { children: ReactNode }) {
    const { children } = props
    const fileSystem = useMemo(
        () => fileSystemHandleSupported() && new FileSystem(),
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
