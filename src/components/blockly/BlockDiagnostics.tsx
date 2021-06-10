import { Grid, Typography } from "@material-ui/core"
import React, { useContext } from "react"
import CodeBlock from "../CodeBlock"
import BlockContext from "./BlockContext"

export default function BlockDiagnostics() {
    const { workspaceXml, workspaceJSON } = useContext(BlockContext)
    return (
        <>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Blockly JSON</Typography>
                <CodeBlock
                    className="json"
                    downloadName={"test.json"}
                    downloadText={JSON.stringify(workspaceJSON, null, 2)}
                >
                    {JSON.stringify(workspaceJSON, null, 2)}
                </CodeBlock>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Blockly XML</Typography>
                <CodeBlock className="xml">{workspaceXml}</CodeBlock>
            </Grid>
        </>
    )
}
