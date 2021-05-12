import React, { useState, KeyboardEvent } from "react"
import { createStyles, Grid, makeStyles, Typography } from "@material-ui/core"
import { HidKeyboardAction, HidKeyboardCmd, HidKeyboardModifiers } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import CmdButton from "../CmdButton"
import ClearIcon from "@material-ui/icons/Clear"
import useServiceServer from "../hooks/useServiceServer";
import HIDKeyboardServer from "../../../jacdac-ts/src/servers/hidkeyboardserver";
import useChange from "../../jacdac/useChange";
import { delay } from "../../../jacdac-ts/src/jdom/utils"

const selectors = {
    "a": 0x04,
    "b": 0x05,
    "c": 0x06,
    "d": 0x07,
    "e": 0x08,
    "f": 0x09,
    "g": 0x0a,
    "h": 0x0b,
    "i": 0x0c,
    "j": 0x0d,
    "k": 0x0e,
    "l": 0x0f,
    "m": 0x10,
    "n": 0x11,
    "o": 0x12,
    "p": 0x13,
    "q": 0x14,
    "r": 0x15,
    "s": 0x16,
    "t": 0x17,
    "u": 0x18,
    "v": 0x19,
    "w": 0x1a,
    "x": 0x1b,
    "y": 0x1c,
    "z": 0x1d,

    "1": 0x1e,
    "2": 0x1f,
    "3": 0x20,
    "4": 0x21,
    "5": 0x22,
    "6": 0x23,
    "7": 0x24,
    "8": 0x25,
    "9": 0x26,
    "0": 0x27,

    "enter": 0x28,
    "escape": 0x29,
    "backspace": 0x2a,
    "tab": 0x2b,
    " ": 0x2c,
    "-": 0x2d,
    "_": 0x2d,
    "=": 0x2e,
    "+": 0x2e,
    // TODO entire list
}
const reverseSelectors: { [index: number]: string } = Object.keys(selectors).reduce((r, key) => { r[selectors[key]] = key; return r }, {})

const useStyles = makeStyles((theme) => createStyles({
    capture: {
        cursor: "pointer",
        "&:hover": {
            borderColor: theme.palette.primary.main,
        },
        "&:focus": {
            borderColor: theme.palette.action.active,
        }
    }
}));

function renderKey(selector: number, modifiers: HidKeyboardModifiers) {
    const values = []
    if ((modifiers & HidKeyboardModifiers.LeftAlt) === HidKeyboardModifiers.LeftAlt) values.push("Alt")
    if ((modifiers & HidKeyboardModifiers.LeftControl) === HidKeyboardModifiers.LeftControl) values.push("Ctrl")
    if ((modifiers & HidKeyboardModifiers.LeftGUI) === HidKeyboardModifiers.LeftGUI) values.push("Cmd")
    if ((modifiers & HidKeyboardModifiers.LeftShift) === HidKeyboardModifiers.LeftShift) values.push("Shift")
    if ((modifiers & HidKeyboardModifiers.RightAlt) === HidKeyboardModifiers.RightAlt) values.push("Right Alt")
    if ((modifiers & HidKeyboardModifiers.RightControl) === HidKeyboardModifiers.RightControl) values.push("Right Ctrl")
    if ((modifiers & HidKeyboardModifiers.RightGUI) === HidKeyboardModifiers.RightGUI) values.push("Right Cmd")
    if ((modifiers & HidKeyboardModifiers.RightShift) === HidKeyboardModifiers.RightShift) values.push("Right Shift")

    values.push(reverseSelectors[selector])

    const value = values.filter(v => !!v).join(" + ")
    return value
}

export default function DashboardHIDKeyboard(props: DashboardServiceProps) {
    const { service } = props
    const [selector, setSelector] = useState(0)
    const [modifiers, setModifiers] = useState(HidKeyboardModifiers.None)
    const server = useServiceServer<HIDKeyboardServer>(service)
    const classes = useStyles()

    const handleKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
        ev.stopPropagation()
        ev.preventDefault()
        const { altKey, ctrlKey, shiftKey, metaKey, key } = ev
        console.log({ key })

        const newSelector = selectors[key.toLowerCase()] || 0
        const newModifiers = modifiers |
            (altKey && HidKeyboardModifiers.LeftAlt) |
            (metaKey && HidKeyboardModifiers.LeftGUI) |
            (ctrlKey && HidKeyboardModifiers.LeftControl) |
            (shiftKey && HidKeyboardModifiers.LeftShift)
        if (newSelector)
            setSelector(newSelector)
        setModifiers(newModifiers)
    }

    const handleKeyUp = (ev: KeyboardEvent<HTMLInputElement>) => {
        ev.stopPropagation()
        ev.preventDefault()
    }

    const handleClear = async () => {
        setSelector(0)
        setModifiers(HidKeyboardModifiers.None)
        await service.sendCmdAsync(HidKeyboardCmd.Clear)
    }

    const handleClick = async () => {
        console.log('send')
        await delay(100)
        const unpacked: [([number, HidKeyboardModifiers, HidKeyboardAction])[]] = [[[selector, modifiers, HidKeyboardAction.Press]]]
        const data = jdpack("r: u16 u8 u8", unpacked)
        await service.sendCmdAsync(HidKeyboardCmd.Key, data)
    }

    const serverValue = useChange(server, _ => _?.lastKey?.map(key => renderKey(key[0], key[1]))?.join("\n"))
    const value = renderKey(selector, modifiers)
    const disabled = !selector
    const clearDisabled = !selector && !modifiers

    return <Grid container spacing={1}>
        <Grid item>
            <pre
                className={classes.capture}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
            >
                {value || "..."}
            </pre>
            <Typography variant="caption">focus and type your key combo (not all keys supported)</Typography>
        </Grid>
        <Grid item xs>
            <input onFocus={handleClick} disabled={disabled} placeholder="focus to send" type="text" />
            <CmdButton title="clear keys" disabled={clearDisabled} onClick={handleClear} icon={<ClearIcon />} />
        </Grid>
        {server && <Grid item xs={12}>
            <Typography variant="caption" component="pre">
                key status: {serverValue || "no keys"}
            </Typography>
        </Grid>}
    </Grid>
}
