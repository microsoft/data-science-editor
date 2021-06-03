import { Grid, Typography } from "@material-ui/core"
import React from "react"
import { VMProgram } from "../../../jacdac-ts/src/vm/VMir"
import { WorkspaceJSON } from "./jsongenerator"
import CodeBlock from "../CodeBlock"

export default function VMDiagnostics(props: {
    program: VMProgram
    source: WorkspaceJSON
    xml: string
}) {
    const { program, source, xml } = props
    return (
        <>
            <Grid item xs={12}>
                <Typography variant="subtitle1">VM</Typography>
                <CodeBlock
                    className="json"
                    downloadName={"test.json.vm"}
                    downloadText={JSON.stringify(program, null, 2)}
                >
                    {JSON.stringify(program, null, 2)}
                </CodeBlock>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Blockly JSON</Typography>
                <CodeBlock
                    className="json"
                    downloadName={"test.json"}
                    downloadText={JSON.stringify(source, null, 2)}
                >
                    {JSON.stringify(source, null, 2)}
                </CodeBlock>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Blockly XML</Typography>
                <CodeBlock className="xml">{xml}</CodeBlock>
            </Grid>
        </>
    )
}
