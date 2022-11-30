import { Grid, TextField } from "@mui/material"
import React, { useContext, useState } from "react"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import BlockContext from "../blockly/BlockContext"
import useChange from "../../jacdac/useChange"
import { BrainScript } from "./braindom"
import CmdButton from "../CmdButton"
import useDeviceScript from "../devicescript/DeviceScriptContext"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"

function SaveScriptButton(props: { script: BrainScript; name: string }) {
    const { script, name } = props
    const { workspaceSaved } = useContext(BlockContext)
    const { source, compiled } = useDeviceScript()

    const sourceBlocks = useChange(script, _ => _.sourceBlocks)
    const ws = JSON.stringify(workspaceSaved)
    const changed = name !== script.name || sourceBlocks !== ws

    const handleUpload = async () => {
        if (name && name !== script.name) await script.updateName(name)
        await script.uploadBody({
            blocks: workspaceSaved ? JSON.stringify(workspaceSaved) : undefined,
            text: source,
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

export default function BrainManagerToolbar(props: { script: BrainScript }) {
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
