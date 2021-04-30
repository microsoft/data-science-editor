import { Typography, useMediaQuery, useTheme } from "@material-ui/core"
import React, { useContext } from "react"
import Flags from "../../jacdac-ts/src/jdom/flags"
import { prettySize } from "../../jacdac-ts/src/jdom/pretty"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import useChange from "../jacdac/useChange"
import { MOBILE_BREAKPOINT } from "./layout"

export default function PacketStats() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { stats } = bus
    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT))
    const current = useChange(stats, s => s.current)
    const { diagnostics } = Flags

    if (mobile || !current.bytes) return null

    const label = `${current.packets} packets per second, ${prettySize(
        current.bytes
    )} per second`
    const text = diagnostics
        ? `${current.packets | 0}#, ${prettySize(current.bytes)}/s`
        : `${prettySize(current.bytes)}/s`
    return (
        <Typography variant="caption" component="span" aria-label={label}>
            {text}
        </Typography>
    )
}
