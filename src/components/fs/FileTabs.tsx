import { Grid } from "@mui/material"
import React from "react"
import useFileSystem from "./FileSystemContext"
import useChange from "../dom/useChange"
import FileSystemChip from "./FileSystemChip"
import FileNewFileChip from "./FileNewFileChip"
import FileSystemNodeChip from "./FileSystemNodeChip"

export default function FileTabs(props: {
    newFileName?: string
    newFileExtension?: string
    newFileContent?: string
    newFileLabel?: string
    directoryFilter?: (directory: string) => boolean
    fileFilter?: (file: string) => boolean
}) {
    const { newFileName, newFileContent, newFileLabel, newFileExtension } =
        props
    const { fileSystem } = useFileSystem()
    const root = useChange(fileSystem, _ => _?.root)
    const workingDirectory = useChange(fileSystem, _ => _?.workingDirectory)
    const directories = useChange(root, _ => _?.directories)
    const handleDirectorySelected = handle => () => {
        fileSystem.workingDirectory = handle
    }
    if (!fileSystem) return null
    return (
        <Grid container spacing={1}>
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
            {directories?.map(node => (
                <Grid item key={node.name}>
                    <FileSystemNodeChip
                        node={node}
                        selected={node === workingDirectory}
                        onClick={handleDirectorySelected(node)}
                    />
                </Grid>
            ))}
        </Grid>
    )
}
