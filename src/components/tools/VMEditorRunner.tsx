import React, { useMemo } from "react"
import { parseITTTMarkdownToJSON } from "../../../jacdac-ts/src/vm/markdown"
import useLocalStorage from "../useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import { Grid } from "@material-ui/core"
import GridHeader from "../ui/GridHeader"
import VMRunner from "../vm/VMRunner"
import DashBoard from "../dashboard/Dashboard"

const VM_MARKDOWN_SOURCE_STORAGE_KEY = "jacdac:vmeditorsource:markdown"

export default function VMEditorRunner() {
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
            {json && (
                <Grid item xs={12}>
                    <VMRunner program={json} />
                </Grid>
            )}
            <Grid item xs={12}>
                <DashBoard />
            </Grid>
        </Grid>
    )
}
