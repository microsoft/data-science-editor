import React from "react"
// tslint:disable-next-line: no-submodule-imports
import { Typography } from "@mui/material"
import usePxtJson from "../makecode/usePxtJson"

export default function MakeCodeDependencies(props: { slug: string; branch: string }) {
    const { slug, branch } = props
    const pxt = usePxtJson(slug, branch)
    const dependencies: Record<string, string> = pxt?.dependencies || {}
    const jds = Object.entries(dependencies).filter(([, value]) =>
        /^github:microsoft\/pxt-jacdac\/\w/i.test(value)
    )
    if (!jds.length) return null

    return (
        <Typography variant="caption">
            Jacdac dependencies:
            {jds.map(([key, value]) => (
                <span style={{ marginLeft: "0.5em" }} key={key}>
                    {value.replace(/^github:microsoft\/pxt-jacdac\//i, "")},
                </span>
            ))}
        </Typography>
    )
}