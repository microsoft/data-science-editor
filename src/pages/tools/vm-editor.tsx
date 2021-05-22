import { createStyles, Grid, makeStyles, NoSsr } from "@material-ui/core"
import React, { useRef, useState } from "react"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import { WorkspaceJSON } from "../../components/blockly/JSONGenerator"
import VmEditor from "../../components/blockly/VmEditor"
import Dashboard from "../../components/dashboard/Dashboard"
import Alert from "../../components/ui/Alert"
import Markdown from "../../components/ui/Markdown"
import useLocalStorage from "../../components/useLocalStorage"

const useStyles = makeStyles(() =>
    createStyles({
        editor: {
            height: "calc(50vh)",
        },
    })
)

const VM_SOURCE_STORAGE_KEY = "jacdac:vmeditor:xml"
export default function Page() {
    const classes = useStyles()
    const [xml, setXml] = useLocalStorage(VM_SOURCE_STORAGE_KEY, "")
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
            <Grid item xs={12}>
                <Alert severity="info" closeable={true}>
                    Start a simulator or connect a device to load the blocks
                    automatically.
                </Alert>
            </Grid>
            <Grid item xs={12}>
                <NoSsr>
                    <VmEditor
                        className={classes.editor}
                        initialXml={xml}
                        onXmlChange={handleXml}
                        onJSONChange={handleJSON}
                        onIT4ProgramChange={handleI4Program}
                    />
                </NoSsr>
            </Grid>
            {Flags.diagnostics && (
                <Grid item xs={12}>
                    <Markdown
                        source={`
### IT4 program

\`\`\`json
${JSON.stringify(program, null, 2)}
\`\`\`   

### Workspace JSON

\`\`\`json
${JSON.stringify(source, null, 2)}
\`\`\`   

### Blockly XML

\`\`\`xml
${xml}
\`\`\`                
`}
                    />
                </Grid>
            )}
            <Grid item xs={12}>
                <Dashboard showStartSimulators={true} />
            </Grid>
        </Grid>
    )
}
