import { Grid } from "@mui/material"
import React from "react"
import { VMProgram } from "../../../jacdac-ts/src/vm/ir"
import CodeBlock from "../CodeBlock"

export default function DeviceScriptVMDiagnostics(props: { program: VMProgram }) {
    const { program } = props
    return (
        <Grid item xs={12}>
            <h3>VM</h3>
            <CodeBlock
                className="json"
                downloadName={"test.json.vm"}
                downloadText={JSON.stringify(program, null, 2)}
            >
                {JSON.stringify(program, null, 2)}
            </CodeBlock>
        </Grid>
    )
}
