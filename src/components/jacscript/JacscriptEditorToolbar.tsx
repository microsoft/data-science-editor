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
import { WorkspaceFile } from "../blockly/dsl/workspacejson"
import useJacscript from "./JacscriptContext"
import useBrainScript from "../brains/useBrainScript"
import { JSONTryParse, toHex } from "../../../jacdac-ts/src/jdom/utils"

function SaveScriptButton(props: { script: BrainScript; name: string }) {
    const { script, name } = props
    const { workspaceSaved } = useContext(BlockContext)
    const { program, compiled } = useJacscript()

    const sourceBlocks = useChange(script, _ => _.sourceBlocks)
    const ws = JSON.stringify(workspaceSaved)
    const changed = name !== script.name || sourceBlocks !== ws

    const handleUpload = async () => {
        if (name && name !== script.name) await script.updateName(name)
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
            color={changed ? "warning" : "primary"}
            variant={changed ? "contained" : "outlined"}
        >
            Save
        </CmdButton>
    )
}

function BrainManagerToolbar(props: { script: BrainScript }) {
    const { script } = props
    const { name } = script
    const [_name, _setName] = useState(name)
    const nameChanged = name !== _name

    const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        _setName(ev.target.value)
    }

    return (
        <Grid sx={{ mt: 0.5, mb: 0.5 }} container direction="row" spacing={1}>
            <Grid item xs>
                <TextField
                    fullWidth
                    label={nameChanged ? "*" : ""}
                    title={`Script Name`}
                    placeholder="Script Name"
                    value={_name}
                    spellCheck={false}
                    onChange={handleChange}
                    size="small"
                />
            </Grid>
            <Grid item>
                <SaveScriptButton script={script} name={_name} />
            </Grid>
        </Grid>
    )
}

function useBrainScriptInBlocks(script: BrainScript) {
    const { loadWorkspaceFile, workspace } = useContext(BlockContext)

    useEffectAsync(async () => {
        if (!script || !workspace) return

        // fetch latest body
        await script.refreshBody()
        const body = script.body

        // update context
        if (!body) return

        // update blocks
        console.debug("current brain script", { body })
        const file = JSONTryParse<WorkspaceFile>(body.blocks)
        loadWorkspaceFile(file)
    }, [script?.id, workspace])
}

export default function JacscriptEditorToolbar() {
    const { scriptId } = useContext(BrainManagerContext)
    const script = useBrainScript(scriptId)
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
