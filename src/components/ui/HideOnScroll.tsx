import { Slide, useScrollTrigger } from "@material-ui/core"
import React from "react"
import { ReactElement } from "react-markdown"

export function HideOnScroll(props: {
    children: ReactElement
    window?: () => Window | Node
}) {
    const { children, window } = props
    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    // This is only being set here because the demo is in an iframe.
    const trigger = useScrollTrigger({ target: window ? window() : undefined })

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    )
}
