import { Grid, TextField } from "@mui/material"
import React, { useContext, useState } from "react"
import BlockRolesToolbar from "../blockly/BlockRolesToolbar"
import JacscriptManagerChipItems from "./JacscriptManagerChipItems"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import BlockContext from "../blockly/BlockContext"
import BrainManagerContext from "../brains/BrainManagerContext"
import useChange from "../../jacdac/useChange"
import { BrainScript } from "../brains/braindom"
import CmdButton from "../CmdButton"
import useEffectAsync from "../useEffectAsync"
import { useDebounce } from "use-debounce"
import { WorkspaceFile } from "../blockly/dsl/workspacejson"
import { JSONTryParse, toHex } from "../../../jacdac-ts/src/jacdac"
import useJacscript from "./JacscriptContext"

function SaveScriptButton(props: { script: BrainScript }) {
    const { script } = props
    const { workspaceSaved } = useContext(BlockContext)
    const { program, compiled } = useJacscript()
    const handleUpload = async () => {
        await script.uploadBody({
            blocks: JSON.stringify(workspaceSaved),
            text: program?.program.join("\n"),
            compiled: compiled?.binary ? toHex(compiled.binary) : undefined,
        })
    }
    return (
        <CmdButton
            icon={<CloudUploadIcon />}
            onClick={handleUpload}
            variant="outlined"
        >
            Save
        </CmdButton>
    )
}

function BrainManagerToolbar(props: { script: BrainScript }) {
    const { script } = props
    const { name } = script
    const [_name, _setName] = useState(name)
    const [debouncedName] = useDebounce(_name, 1000)

    const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        _setName(ev.target.value)
    }

    useEffectAsync(() => script?.updateName(debouncedName), [debouncedName])

    return (
        <Grid sx={{ mt: 0.5, mb: 0.5 }} container direction="row" spacing={1}>
            <Grid item xs>
                <TextField
                    fullWidth
                    label={`Script Name${name !== _name ? "*" : ""}`}
                    value={_name}
                    spellCheck={false}
                    onChange={handleChange}
                    size="small"
                />
            </Grid>
            <Grid item>
                <SaveScriptButton script={script} />
            </Grid>
        </Grid>
    )
}

function useBrainScriptInBlocks(script: BrainScript) {
    const { loadWorkspaceFile, workspace } = useContext(BlockContext)

    useEffectAsync(async () => {
        if (!script || !workspace) return

        // fetch latest body
        const body = await script.refreshBody()

        // update context
        if (!body) return

        // update blocks
        console.debug("current brain script", { body })
        const file = JSONTryParse<WorkspaceFile>(body.blocks)
        loadWorkspaceFile(file)
    }, [script?.id, workspace])
}

export default function JacscriptEditorToolbar() {
    const { brainManager, scriptId } = useContext(BrainManagerContext)
    const script = useChange(brainManager, _ => _?.script(scriptId))

    useBrainScriptInBlocks(script)

    return (
        <>
            {script && (
                <Grid item xs={12}>
                    <BrainManagerToolbar script={script} />
                </Grid>
            )}
            <Grid item xs={12}>
                <BlockRolesToolbar>
                    <JacscriptManagerChipItems />
                </BlockRolesToolbar>
            </Grid>
        </>
    )
}
