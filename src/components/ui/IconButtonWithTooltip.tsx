import { IconButtonProps } from "@material-ui/core"
import { IconButton } from "gatsby-theme-material-ui"
import React from "react"
import Zoom from "@material-ui/core/Zoom"
import Tooltip from "./Tooltip"

export default function IconButtonWithTooltip(
    props: { to?: string; disabled?: boolean } & IconButtonProps
) {
    const { title, children, disabled, ...others } = props
    return (
        <Tooltip TransitionComponent={Zoom} title={title}>
            <span>
                <IconButton aria-label={title} disabled={disabled} {...others}>
                    {children}
                </IconButton>
            </span>
        </Tooltip>
    )
}
