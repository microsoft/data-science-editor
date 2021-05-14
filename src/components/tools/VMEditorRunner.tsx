import React, { useMemo, useContext } from "react"
import { parseITTTMarkdownToJSON } from "../../../jacdac-ts/src/vm/markdown"
import useLocalStorage from "../useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import { Grid } from "@material-ui/core"
import GridHeader from "../ui/GridHeader"
import Alert from "../ui/Alert"
import VMRunner from "../vm/VMRunner"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import DashBoard from "../dashboard/Dashboard"

const VM_MARKDOWN_SOURCE_STORAGE_KEY = "jacdac:vmeditorsource:markdown"

export default function VMEditorRunner() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [source, setSource] = useLocalStorage(
        VM_MARKDOWN_SOURCE_STORAGE_KEY,
        `# VM Handler program\n\n`
    )
    const json = useMemo(() => parseITTTMarkdownToJSON(source), [source])
    return (
        <Grid spacing={2} container>
            <Grid item xs={12}>
                <HighlightTextField
                    code={source}
                    language={"markdown"}
                    onChange={setSource}
                    annotations={json?.errors}
                />
            </Grid>
            <GridHeader title="Preview" />
            {json && bus && (
                <Grid item xs={12}>
                    <VMRunner json={json} bus={bus} />
                </Grid>
            )}
            <Grid xs={12}>
                <DashBoard />
            </Grid>
        </Grid>
    )
}
