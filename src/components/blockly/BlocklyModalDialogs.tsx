import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    TextField,
} from "@mui/material"
import Blockly from "blockly"
import { Button } from "gatsby-theme-material-ui"
import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { useId } from "react"

/**
 * Component that injects dialogs in blockly
 */
export default function BlocklyModalDialogs() {
    const [dialogType, setDialogType] = useState<
        "alert" | "confirm" | "prompt"
    >()
    const [message, setMessage] = useState("")
    const [value, setValue] = useState("")
    const valueId = useId()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback = useRef<any>()
    const showDialog = !!dialogType

    useEffect(() => {
        // store older
        const previous = {
            alert: Blockly.alert,
            confirm: Blockly.confirm,
            prompt: Blockly.prompt,
        }

        // replace
        Blockly.alert = (message, cb) => {
            setMessage(message)
            callback.current = cb
            setDialogType("alert")
        }
        Blockly.confirm = (message, cb) => {
            setMessage(message)
            callback.current = cb
            setDialogType("confirm")
        }
        Blockly.prompt = (message, defaultValue, cb) => {
            setMessage(message)
            setValue(defaultValue)
            callback.current = cb
            setDialogType("prompt")
        }

        // cleanup
        return () => {
            Blockly.alert = previous.alert
            Blockly.confirm = previous.confirm
            Blockly.prompt = previous.prompt
        }
    }, [])

    const handleCloseConfirm = () => setDialogType(undefined)
    const handleCancel = () => {
        callback.current?.(undefined)
        setDialogType(undefined)
    }
    const handleOk = () => {
        switch (dialogType) {
            case "alert":
                callback.current?.()
                break
            case "confirm":
                callback.current(true)
                break
            case "prompt":
                callback.current(value)
                break
        }
        setDialogType(undefined)
    }
    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
    }

    return (
        <Dialog open={showDialog} onClose={handleCloseConfirm}>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
                {dialogType === "prompt" && (
                    <TextField
                        id={valueId}
                        value={value}
                        label="Value"
                        fullWidth={true}
                        onChange={handleValueChange}
                    />
                )}
            </DialogContent>
            <DialogActions>
                {dialogType !== "alert" && (
                    <Button variant="contained" onClick={handleCancel}>
                        Cancel
                    </Button>
                )}
                <Button variant="contained" color="primary" onClick={handleOk}>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    )
}
