import { Container, Grid } from "@mui/material"
import React from "react"
import TraceAnalyzer from "../../components/trace/TraceAnalyzer"
import Markdown from "../../components/ui/Markdown"

export default function Page() {
    const text = `
### Collecting traces

Record traces in your logic analyser and replay them to test your services.

* open the packet console
* click on the import button to load a trace
* click on the replay button to start running the trace

### Trace Format

The trace is a text file where each line is composed of 3 parts:

    timestamp framebuffer description

where 

-   "timestamp" is ellapsed milliseconds of the frame in the trace,
-   "framebuffer" is a hex-encoded frame
-   "description" is a human readable description of the frame, it is ignored.  

### Saleae LOGIC

Use [Saleae LOGIC](https://www.saleae.com/) analyser to record trace on the Jacdac data line.

* Add an "Async Serial" protocol analyser
* Select "1Mbit"
* Export to "CSV/hex".
`

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TraceAnalyzer />
                </Grid>
            </Grid>
            <Container>
                <Markdown source={text} />
            </Container>
        </>
    )
}
