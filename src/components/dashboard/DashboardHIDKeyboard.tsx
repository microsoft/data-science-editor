import React, { useState } from "react"
import { Grid } from "@material-ui/core"
import {
    HidKeyboardAction,
    HidKeyboardCmd,
    HidKeyboardModifiers,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import CmdButton from "../CmdButton"
import ClearIcon from "@material-ui/icons/Clear"
import KeyboardKeyInput from "../ui/KeyboardKeyInput"
import KeyboardIcon from "@material-ui/icons/Keyboard"
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

    const handleClear = async () => {
        setSelector(0)
        setModifiers(HidKeyboardModifiers.None)
        await service.sendCmdAsync(HidKeyboardCmd.Clear)
    }

    const handleClick = async () => {
        const unpacked: [[number, HidKeyboardModifiers, HidKeyboardAction][]] =
            [[[selector, modifiers, HidKeyboardAction.Press]]]
        const data = jdpack("r: u16 u8 u8", unpacked)
        await service.sendCmdAsync(HidKeyboardCmd.Key, data)
    }

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
                    title="send keys"
                    disabled={disabled}
                    onClick={handleClick}
                    icon={<KeyboardIcon />}
                >
                    Send keys
                </CmdButton>
                <CmdButton
                    title="clear keys"
                    disabled={disabled}
                    onClick={handleClear}
                    icon={<ClearIcon />}
                />
            </Grid>
        </Grid>
    )
}
