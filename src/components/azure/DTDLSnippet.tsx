import { Link } from "gatsby-theme-material-ui"
import React, { useMemo } from "react"
import { DTDLNode } from "../../../jacdac-ts/src/azure-iot/dtdl"
import Snippet from "../ui/Snippet"

export function DTDLSnippet(props: {
    node: DTDLNode | DTDLNode[]
    name?: string
}) {
    const { node, name } = props
    const dtdl = useMemo<string>(() => JSON.stringify(node, null, 2), [node])

    if (!node) return null

    return (
        <Snippet
            value={dtdl}
            mode="json"
            download={`${name || "dtdl"}.json`}
            caption={
                <>
                    <Link to="/dtmi">DTDL</Link> is an open source modelling
                    language developed by Microsoft Azure.
                </>
            }
        />
    )
}
