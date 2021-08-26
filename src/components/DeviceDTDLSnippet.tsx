import React, { useMemo } from "react"
import { deviceClassToDTDL } from "../../jacdac-ts/src/azure-iot/dtdlspec"
import { DTDLSnippet } from "./azure/DTDLSnippet"

export function DeviceDTDLSnippet(props: { dev: jdspec.DeviceSpec }) {
    const { dev } = props
    const dtdl = useMemo(() => deviceClassToDTDL(dev), [dev])

    return <DTDLSnippet node={dtdl} name={dev.name} />
}
