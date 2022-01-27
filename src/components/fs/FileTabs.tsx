import { Grid } from "@mui/material"
import React, { useContext, useRef } from "react"
import useKeyboardNavigationProps from "../hooks/useKeyboardNavigationProps"
import FileSystemContext from "../FileSystemContext"
import useChange from "../../jacdac/useChange"
import FileSystemChip from "./FileSystemChip"
import FileNewFileChip from "./FileNewFileChip"
import FileSystemNodeChip from "./FileSystemNodeChip"

export default function FileTabs(props: {
    newFileName?: string
    newFileExtension?: string
    newFileContent?: string
    newFileLabel?: string
    hideDirectories?: boolean
    hideFiles?: boolean
    directoryFilter?: (directory: string) => boolean
    fileFilter?: (file: string) => boolean
}) {
    const {
        newFileName,
        newFileContent,
        hideDirectories,
        hideFiles,
        directoryFilter,
        fileFilter,
        newFileLabel,
        newFileExtension,
    } = props
    const { fileSystem } = useContext(FileSystemContext)
    const root = useChange(fileSystem, _ => _?.root)
    const workingDirectory = useChange(fileSystem, _ => _?.workingDirectory)
    const workingFile = useChange(fileSystem, _ => _?.workingFile)
    const directories = useChange(root, _ =>
        _?.directories?.filter(d => !directoryFilter || directoryFilter(d.name))
    )
    const files = useChange(root, _ =>
        _?.files?.filter(d => !fileFilter || fileFilter(d.name))
    )
    const gridRef = useRef()
    const keyboardProps = useKeyboardNavigationProps(gridRef.current)
    const handleDirectorySelected = handle => () =>
        (fileSystem.workingDirectory = handle)
    const handleFileSelected = handle => () => (fileSystem.workingFile = handle)

    if (!fileSystem) return null

    return (
        <Grid ref={gridRef} container spacing={1} {...keyboardProps}>
            <Grid item>
                <FileSystemChip />
            </Grid>
            {root && newFileContent && (
                <Grid item>
                    <FileNewFileChip
                        name={newFileName}
                        content={newFileContent}
                        label={newFileLabel}
                        extension={newFileExtension}
                    />
                </Grid>
            )}
            {!hideDirectories &&
                directories?.map(node => (
                    <Grid item key={node.name}>
                        <FileSystemNodeChip
                            node={node}
                            selected={node === workingDirectory}
                            onClick={handleDirectorySelected(node)}
                        />
                    </Grid>
                ))}
            {!hideFiles &&
                files?.map(node => (
                    <Grid item key={node.name}>
                        <FileSystemNodeChip
                            node={node}
                            selected={node === workingFile}
                            onClick={handleFileSelected(node)}
                        />
                    </Grid>
                ))}
        </Grid>
    )
}
