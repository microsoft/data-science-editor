import React from "react"
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser"
import useFileSystem from "./FileSystemContext"
import useChange from "../dom/useChange"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

export default function FileSystemButton() {
    const { fileSystem, showDirectoryPicker } = useFileSystem()
    const root = useChange(fileSystem, _ => _?.root)
    const handleOpenDirectory = () => showDirectoryPicker({ mode: "readwrite" })

    if (!fileSystem) return null

    return (
        <IconButtonWithTooltip
            title={root?.name || "open directory"}
            color="inherit"
            onClick={handleOpenDirectory}
        >
            <OpenInBrowserIcon />
        </IconButtonWithTooltip>
    )
}
