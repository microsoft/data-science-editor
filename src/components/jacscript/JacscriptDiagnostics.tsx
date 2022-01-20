import { Grid } from "@mui/material"
import React from "react"
import CodeBlock from "../CodeBlock"
import {JacScriptProgram} from "../../../jacdac-ts/src/vm/ir2jacscript"

export default function JacscriptDiagnostics(props: { program: JacScriptProgram }) {
    const { program } = props
    return (
        <Grid item xs={12}>
            <h3>Jacscript</h3>
            <CodeBlock
                className="javascript"
                downloadName={"test.jcs.json"}
                downloadText={program && JSON.stringify(program, null, 2)}
            >
                {program?.program.join("\n") || "--"}
            </CodeBlock>
        </Grid>
    )
}
