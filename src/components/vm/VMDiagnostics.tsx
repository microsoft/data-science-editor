import { Grid, Typography } from "@material-ui/core"
import React from "react"
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import { WorkspaceJSON } from "./jsongenerator"
import CodeBlock from "../CodeBlock"

export default function VMDiagnostics(props: {
    program: IT4Program
    source: WorkspaceJSON
    xml: string
}) {
    const { program, source, xml } = props
    return (
        <>
            <Grid item xs={12}>
                <Typography variant="subtitle1">IT4</Typography>
                <CodeBlock
                    className="json"
                    downloadName={"test.json.it4"}
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
