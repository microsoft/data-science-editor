import { Grid } from "@mui/material"
import React, { useContext } from "react"
import CodeBlock from "../CodeBlock"
import BlockContext from "./BlockContext"

export default function BlockDiagnostics() {
    const { workspaceXml, workspaceJSON } = useContext(BlockContext)
    return (
        <>
            <Grid item xs={12}>
                <h3>Blockly JSON</h3>
                <CodeBlock
                    className="json"
                    downloadName={"test.json"}
                    downloadText={JSON.stringify(workspaceJSON, null, 2)}
                >
                    {JSON.stringify(workspaceJSON, null, 2)}
                </CodeBlock>
            </Grid>
            <Grid item xs={12}>
                <h3>Blockly XML</h3>
                <CodeBlock className="xml">{workspaceXml}</CodeBlock>
            </Grid>
        </>
    )
}
