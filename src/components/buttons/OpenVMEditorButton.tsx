import React from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import ExtensionIcon from "@mui/icons-material/Extension"

export default function OpenVMEditorButton(props: { className?: string }) {
    const { className } = props

    return (
        <IconButtonWithTooltip
            trackName="menu.vm"
            className={className}
            title="Block Editor"
            edge="start"
            color="inherit"
            to="/editors/vm/"
        >
            <ExtensionIcon />
        </IconButtonWithTooltip>
    )
}
