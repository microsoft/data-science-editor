import { IconButtonProps, useTheme } from "@mui/material"
import { IconButton } from "gatsby-theme-material-ui"
import React from "react"
import Zoom from "@mui/material/Zoom"
import Tooltip from "./Tooltip"
import useAnalytics, { EventProperties } from "../hooks/useAnalytics"

export default function IconButtonWithTooltip(
    props: {
        to?: string
        disabled?: boolean
        selected?: boolean
        trackName?: string
        trackProperties?: EventProperties
    } & IconButtonProps
) {
    const {
        title,
        children,
        disabled,
        trackName,
        trackProperties,
        selected,
        onClick,
        ...others
    } = props
    const { trackEvent } = useAnalytics()
    const { palette } = useTheme()

    const handleClick =
        !trackName || !trackEvent || !onClick
            ? onClick
            : ev => {
                  trackEvent(trackName, trackProperties)
                  onClick(ev)
              }

    return (
        <Tooltip TransitionComponent={Zoom} title={title}>
            <span>
                <IconButton
                    aria-label={title}
                    disabled={disabled}
                    onClick={handleClick}
                    style={{
                        background:
                            selected === false
                                ? palette.background.paper
                                : selected === true
                                ? palette.secondary.main
                                : undefined,
                    }}
                    {...others}
                >
                    {children}
                </IconButton>
            </span>
        </Tooltip>
    )
}
