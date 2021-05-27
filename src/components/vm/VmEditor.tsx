import { Grid, NoSsr, Typography } from "@material-ui/core"
import React, { useState } from "react"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import { WorkspaceJSON } from "../../components/vm/jsongenerator"
import VMBlockEditor from "../../components/vm/VMBlockEditor"
import Dashboard from "../../components/dashboard/Dashboard"
import Alert from "../../components/ui/Alert"
import useLocalStorage from "../../components/useLocalStorage"
import VMRunner from "../../components/vm/VMRunner"
import CodeBlock from "../../components/CodeBlock"

function Diagnostics(props: {
    program: IT4Program
    source: WorkspaceJSON
    xml: string
}) {
    const { program, source, xml } = props
    return (
        <>
            <Grid item xs={12}>
                <Typography variant="subtitle1">IT4</Typography>
                <CodeBlock className="json">
                    {JSON.stringify(program, null, 2)}
                </CodeBlock>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Blockly JSON</Typography>
                <CodeBlock className="json">
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

const VM_SOURCE_STORAGE_KEY = "jacdac:tools:vmeditor"
export default function VMEditor(props: {
    storageKey?: string
    showDashboard?: boolean
}) {
    const { storageKey, showDashboard } = props
    const [xml, setXml] = useLocalStorage(storageKey || VM_SOURCE_STORAGE_KEY, "")
    const [source, setSource] = useState<WorkspaceJSON>()
    const [program, setProgram] = useState<IT4Program>()

    const handleXml = (xml: string) => {
        setXml(xml)
    }
    const handleJSON = (json: WorkspaceJSON) => {
        const newSource = JSON.stringify(json)
        if (JSON.stringify(source) !== newSource) setSource(json)
    }
    const handleI4Program = (json: IT4Program) => {
        const newProgram = JSON.stringify(json)
        if (JSON.stringify(program) !== newProgram) setProgram(json)
    }

    return (
        <Grid container direction="column" spacing={1}>
            {!source?.blocks?.length && (
                <Grid item xs={12}>
                    <Alert severity="info" closeable={true}>
                        Start a simulator or connect a device to load the blocks
                        automatically.
                    </Alert>
                </Grid>
            )}
            <Grid item xs={12}>
                <NoSsr>
                    <VMBlockEditor
                        initialXml={xml}
                        onXmlChange={handleXml}
                        onJSONChange={handleJSON}
                        onIT4ProgramChange={handleI4Program}
                    />
                </NoSsr>
            </Grid>
            <Grid item xs={12}>
                <VMRunner program={program} autoStart={true} />
            </Grid>
            {Flags.diagnostics && (
                <Diagnostics program={program} source={source} xml={xml} />
            )}
            {showDashboard && (
                <Grid item xs={12}>
                    <Dashboard showStartSimulators={true} />
                </Grid>
            )}
        </Grid>
    )
}
