import { createStyles, Grid, makeStyles, NoSsr } from "@material-ui/core"
import React, { useState } from "react"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { WorkspaceJSON } from "../../components/blockly/generator"
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
    const [source, setSource] = useState("")

    const handleXml = (xml: string) => {
        setXml(xml)
    }

    const handleJSON = (json: WorkspaceJSON) => {
        const newSource = JSON.stringify(json, null, 2)
        setSource(newSource)
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
                    />
                </NoSsr>
            </Grid>
            {Flags.diagnostics && (
                <Grid item xs={12}>
                    <Markdown
                        source={`
\`\`\`json
${source}
\`\`\`   

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
