import { IconButtonProps } from "@material-ui/core"
import { IconButton } from "gatsby-theme-material-ui"
import React from "react"
import Zoom from "@material-ui/core/Zoom"
import Tooltip from "./Tooltip"
import useAnalytics, { EventProperties } from "../hooks/useAnalytics"

export default function IconButtonWithTooltip(
    props: {
        to?: string
        disabled?: boolean
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
        onClick,
        ...others
    } = props
    const { trackEvent } = useAnalytics()

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
                    {...others}
                >
                    {children}
                </IconButton>
            </span>
        </Tooltip>
    )
}
