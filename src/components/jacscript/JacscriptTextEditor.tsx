import React, { useContext, useEffect } from "react"
import { Grid, NoSsr } from "@mui/material"
import useLocalStorage from "../hooks/useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import useJacscript, { JacscriptProvider } from "./JacscriptContext"
import { useDebounce } from "use-debounce"
import JacscriptManagerChipItems from "./JacscriptManagerChipItems"
import useChange from "../../jacdac/useChange"
import FileSystemContext from "../FileSystemContext"
import useEffectAsync from "../useEffectAsync"
import useSnackbar from "../hooks/useSnackbar"
import FileTabs from "../fs/FileTabs"

const STORAGE_KEY = "jacdac:jacscripttexteditorsource"
const JACSCRIPT_FILENAME = "fw.js"
const JACSCRIPT_NEW_FILE_CONTENT = ""

function JacscriptTextEditorWithContext() {
    const { setProgram, compiled } = useJacscript()
    const { setError } = useSnackbar()
    const { fileSystem } = useContext(FileSystemContext)
    const workspaceDirectory = useChange(fileSystem, _ => _?.workingDirectory)
    const workspaceFile = useChange(workspaceDirectory, _ =>
        _?.file(JACSCRIPT_FILENAME, { create: true })
    )
    const [source, setSource] = useLocalStorage(STORAGE_KEY, "")
    const [debouncedSource] = useDebounce(source, 1000)

    // debounced text buffer UI
    useEffect(() => {
        setProgram({
            program: debouncedSource?.split(/\n/g),
            debug: [],
        })
    }, [debouncedSource])
    // load from file
    useEffectAsync(
        async mounted => {
            if (!workspaceFile) return
            try {
                const text = await workspaceFile.textAsync()
                if (!mounted()) return

                setSource(text)
            } catch (e) {
                if (mounted()) setError(e)
                if (fileSystem) fileSystem.workingDirectory = undefined
            }
        },
        [workspaceFile]
    )
    // save to file on changes
    useEffectAsync(
        async mounted => {
            try {
                await workspaceFile?.write(source || "")
            } catch (e) {
                console.debug(e)
                if (mounted()) setError(e)
            }
        },
        [source, workspaceFile]
    )

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
            {!!fileSystem && (
                <Grid item xs={12}>
                    <FileTabs
                        newFileName={JACSCRIPT_FILENAME}
                        newFileContent={JACSCRIPT_NEW_FILE_CONTENT}
                        hideFiles={true}
                    />
                </Grid>
            )}
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
