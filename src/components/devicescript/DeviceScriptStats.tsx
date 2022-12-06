import { Typography } from "@mui/material"
import React, { useContext } from "react"
import { prettySize } from "../../../jacdac-ts/src/jdom/pretty"
import { DeviceScriptContext } from "./DeviceScriptContext"

export default function DeviceScriptStats() {
    const { bytecode, dbg } = useContext(DeviceScriptContext)

    if (!dbg) return null

    const { sizes } = dbg
    return (
        <Typography variant="caption">
            total: {prettySize(bytecode.length)},{" "}
            {Object.keys(sizes)
                .map(name => `${name}: ${prettySize(sizes[name])}`)
                .join(", ")}
        </Typography>
    )
}
