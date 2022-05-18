import { Chip } from "@mui/material"
import React from "react"
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser"
import useFileSystem from "../FileSystemContext"
import useChange from "../../jacdac/useChange"

export default function FileSystemChip() {
    const { fileSystem, showDirectoryPicker } = useFileSystem()
    const root = useChange(fileSystem, _ => _?.root)
    const handleOpenDirectory = showDirectoryPicker
    const handleCloseDirectory = () => (fileSystem.root = undefined)

    if (!fileSystem) return null

    return (
        <Chip
            clickable
            avatar={<OpenInBrowserIcon />}
            label={root?.name || "open directory"}
            onClick={handleOpenDirectory}
            onDelete={root ? handleCloseDirectory : undefined}
        />
    )
}
