import React from "react"
import { ButtonProps } from "@material-ui/core"
import { Button as GatsbyButton } from "gatsby-theme-material-ui"
import useAnalytics, { EventProperties } from "../hooks/useAnalytics"

export default function Button(
    props: {
        trackName?: string
        trackProperties?: EventProperties
    } & ButtonProps
) {
    const { trackName, trackProperties, onClick, ...rest } = props
    const { trackEvent } = useAnalytics()
    const handleClick =
        !trackName || !trackEvent || !onClick
            ? onClick
            : ev => {
                  trackEvent(trackName, trackProperties)
                  onClick(ev)
              }
    return <GatsbyButton onClick={handleClick} {...rest} />
}
