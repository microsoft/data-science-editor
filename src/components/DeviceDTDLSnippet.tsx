import { Link } from "gatsby-theme-material-ui"
import React, { useMemo } from "react"
import { deviceClassToDTDL } from "../../jacdac-ts/src/azure-iot/dtdlspec"
import Snippet from "./ui/Snippet"

export function DeviceDTDLSnippet(props: { dev: jdspec.DeviceSpec }) {
    const { dev } = props

    const dtdl = useMemo<string>(
        () => JSON.stringify(deviceClassToDTDL(dev), null, 2),
        [dev]
    )

    return (
        <Snippet
            value={dtdl}
            mode="json"
            download={`${dev.name}.json`}
            caption={
                <>
                    <Link to="/dtmi">DTDL</Link> is an open source modelling
                    language developed by Microsoft Azure.
                </>
            }
        />
    )
}
