import { Grid } from "@mui/material"
import React from "react"
import CodeBlock from "../CodeBlock"
import { JacScriptProgram } from "../../../jacdac-ts/src/vm/ir2jacscript"
import { VMCompileResponse } from "../../workers/vm/vm.worker"

export default function JacscriptDiagnostics(props: {
    program: JacScriptProgram
    compiled: VMCompileResponse
}) {
    const { program, compiled } = props
    const { logs, errors } = compiled || {}
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
            <h4>Logs</h4>
            {logs && <pre>{logs}</pre>}
            <h5>Errors</h5>
            <ul>
                {errors?.map((error) => (
                    <li key={`${error.line}:${error.column}:${error.message}`}>
                        {error.line}:{error.column}&gt; {error.message}
                        <pre>{error.codeFragment}</pre>
                    </li>
                ))}
            </ul>
        </Grid>
    )
}
