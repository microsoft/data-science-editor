import { Typography } from "@material-ui/core"
import React, { useContext } from "react"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { prettySize } from "../../../jacdac-ts/src/jdom/pretty"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"
import useMediaQueries from "../hooks/useMediaQueries"

export default function PacketStats() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { packetStats } = bus
    const { mobile } = useMediaQueries()
    const current = useChange(packetStats, _ => _.current)
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
