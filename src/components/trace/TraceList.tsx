import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { parseTrace } from "../../../jacdac-ts/src/jdom/logparser"
import { Trace } from "../../../jacdac-ts/src/jdom/trace/trace"
import { Grid } from "@mui/material"
import TraceCard from "./TraceCard"
import useGridBreakpoints from "../useGridBreakpoints"

export default function TraceList() {
    const gridBreakpoints = useGridBreakpoints()
    const data = useStaticQuery(graphql`
        query {
            allPlainText {
                nodes {
                    content
                    parent {
                        ... on File {
                            name
                            ext
                        }
                    }
                }
            }
        }
    `)
    const traces: { trace: Trace; name: string }[] = data.allPlainText.nodes
        .filter(node => node.parent?.ext === ".txt")
        .map(node => {
            return {
                trace: parseTrace(node.content as string),
                name: node.parent.name as string,
            }
        })
        .filter(trace => !!trace.trace)

    return (
        <Grid container spacing={2}>
            {traces.map(({ trace, name }) => (
                <Grid item key={name}>
                    <TraceCard name={name} trace={trace} {...gridBreakpoints} />
                </Grid>
            ))}
        </Grid>
    )
}
