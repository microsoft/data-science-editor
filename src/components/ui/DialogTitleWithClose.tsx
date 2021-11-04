import { DialogTitle, DialogTitleProps } from "@mui/material"
import React, { ReactNode } from "react"
import CloseIcon from "@mui/icons-material/Close"
import IconButtonWithTooltip from "./IconButtonWithTooltip"

export default function DialogTitleWithClose(
    props: { onClose: () => void; children: ReactNode } & DialogTitleProps
) {
    const { onClose, children, ...others } = props
    return (
        <DialogTitle {...others}>
            {children}
            <IconButtonWithTooltip
                title="close"
                onClick={onClose}
                sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: theme => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButtonWithTooltip>
        </DialogTitle>
    )
}
