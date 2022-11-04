import { Dialog, DialogActions, DialogContent, TextField } from "@mui/material"
import React, { useContext, useId, useState } from "react"
import CmdButton from "../CmdButton"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"
import BrainManagerContext from "./BrainManagerContext"

export default function CreateBrainScriptDialog(props: {
    onClose: () => void
}) {
    const { onClose } = props
    const [name, setName] = useState("my device")
    const id = useId()
    const nameId = "name-" + id
    const { createScript, openScript } = useContext(BrainManagerContext)

    const handleNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setName(ev.target.value)
    }
    const handleNewText = async () => {
        onClose()
        const script = await createScript(name, "js")
        await openScript(script?.scriptId)
    }
    const handleNewBlocks = async () => {
        onClose()
        const script = await createScript(name, "blocks")
        await openScript(script?.scriptId)
    }

    return (
        <Dialog open={true} fullWidth={true} onClose={onClose}>
            <DialogTitleWithClose onClose={onClose}>
                Create new script
            </DialogTitleWithClose>
            <DialogContent>
                <TextField
                    id={nameId}
                    value={name}
                    label="Name"
                    sx={{ mt: 1, mb: 1 }}
                    fullWidth={true}
                    type="text"
                    placeholder="Script name"
                    onChange={handleNameChange}
                />
            </DialogContent>
            <DialogActions>
                <CmdButton
                    variant="contained"
                    color="primary"
                    onClick={handleNewText}
                >
                    JavaScript
                </CmdButton>
                <CmdButton
                    variant="contained"
                    color="primary"
                    onClick={handleNewBlocks}
                >
                    Blocks
                </CmdButton>
            </DialogActions>
        </Dialog>
    )
}
