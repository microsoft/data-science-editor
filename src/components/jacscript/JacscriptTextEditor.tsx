import React, { useContext, useEffect } from "react"
import { Grid, NoSsr } from "@mui/material"
import useLocalStorage from "../hooks/useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import useJacscript, { JacscriptProvider } from "./JacscriptContext"
import { useDebounce } from "use-debounce"
import JacscriptManagerChipItems from "./JacscriptManagerChipItems"

const STORAGE_KEY = "jacdac:jacscripttexteditorsource"

function JacscriptTextEditorWithContext() {
    const { setProgram, compiled } = useJacscript()
    const [source, setSource] = useLocalStorage(STORAGE_KEY, "")
    const [debouncedSource] = useDebounce(source, 1000)
    useEffect(() => {
        setProgram({
            program: debouncedSource?.split(/\n/g),
            debug: [],
        })
    }, [debouncedSource])
    const annotations = compiled?.errors?.map(
        error =>
            ({
                file: error.filename,
                line: error.line,
                message: error.message,
            } as jdspec.Diagnostic)
    )
    return (
        <Grid spacing={1} container>
            <Grid item xs={12}>
                <Grid container direction="column" spacing={1}>
                    <JacscriptManagerChipItems />
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <HighlightTextField
                    code={source}
                    language={"javascript"}
                    onChange={setSource}
                    annotations={annotations}
                />
            </Grid>
        </Grid>
    )
}

export default function JacscriptTextEditor() {
    return (
        <NoSsr>
            <JacscriptProvider>
                <JacscriptTextEditorWithContext />
            </JacscriptProvider>
        </NoSsr>
    )
}
