import React from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import ExtensionIcon from "@material-ui/icons/Extension"

export default function OpenVMEditorButton(props: { className?: string }) {
    const { className } = props

    return (
        <IconButtonWithTooltip
            className={className}
            title="Block Editor"
            edge="start"
            color="inherit"
            to="/tools/vm-editor/"
        >
            <ExtensionIcon />
        </IconButtonWithTooltip>
    )
}
