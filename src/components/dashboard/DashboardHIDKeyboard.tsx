import React, { useCallback, useState } from "react"
import { Grid } from "@mui/material"
import {
    HidKeyboardAction,
    HidKeyboardCmd,
    HidKeyboardModifiers,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import CmdButton from "../CmdButton"
import KeyboardKeyInput from "../ui/KeyboardKeyInput"
import KeyboardIcon from "@mui/icons-material/Keyboard"

export default function DashboardHIDKeyboard(props: DashboardServiceProps) {
    const { service } = props
    const [selector, setSelector] = useState(0)
    const [modifiers, setModifiers] = useState(HidKeyboardModifiers.None)

    const handleKeyChange = (
        newSelector: number,
        newModifiers: HidKeyboardModifiers
    ) => {
        setSelector(newSelector)
        setModifiers(newModifiers)
    }

    const handleClick = useCallback(async () => {
        const unpacked: [[number, HidKeyboardModifiers, HidKeyboardAction][]] =
            [[[selector, modifiers, HidKeyboardAction.Press]]]
        const data = jdpack("r: u16 u8 u8", unpacked)
        await service.sendCmdAsync(HidKeyboardCmd.Key, data)
    }, [selector, modifiers, service])

    const disabled = !selector && !modifiers

    return (
        <Grid container direction="column" spacing={1}>
            <Grid item xs={12}>
                <KeyboardKeyInput
                    selector={selector}
                    modifiers={modifiers}
                    onChange={handleKeyChange}
                />
            </Grid>
            <Grid item xs={12}>
                <CmdButton
                    variant="outlined"
                    title="send keys"
                    disabled={disabled}
                    onClick={handleClick}
                    icon={<KeyboardIcon />}
                >
                    Send keys
                </CmdButton>
            </Grid>
        </Grid>
    )
}
