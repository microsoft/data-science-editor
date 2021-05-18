import React, { useState, KeyboardEvent, useRef } from "react"
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
import { delay } from "../../../jacdac-ts/src/jdom/utils"
import KeyboardKeyInput from "../ui/KeyboardKeyInput"

export default function DashboardHIDKeyboard(props: DashboardServiceProps) {
    const { service } = props
    const [selector, setSelector] = useState(0)
    const [modifiers, setModifiers] = useState(HidKeyboardModifiers.None)
    const [received, setReceived] = useState<string[]>([])
    const inputButtonRef = useRef<HTMLInputElement>()

    const handleKeyChange = (
        newSelector: number,
        newModifiers: HidKeyboardModifiers
    ) => {
        setSelector(newSelector)
        setModifiers(newModifiers)
    }

    const handleKeyDownReceived = (ev: KeyboardEvent<HTMLInputElement>) => {
        ev.stopPropagation()
        ev.preventDefault()
        const { code } = ev
        setReceived([...received, code.toLocaleLowerCase()])
    }

    const handleClear = async () => {
        inputButtonRef.current.value = ""
        setSelector(0)
        setModifiers(HidKeyboardModifiers.None)
        await service.sendCmdAsync(HidKeyboardCmd.Clear)
    }

    const handleClick = async () => {
        setReceived([])
        await delay(100)
        const unpacked: [
            [number, HidKeyboardModifiers, HidKeyboardAction][]
        ] = [[[selector, modifiers, HidKeyboardAction.Press]]]
        const data = jdpack("r: u16 u8 u8", unpacked)
        await service.sendCmdAsync(HidKeyboardCmd.Key, data)
    }

    const clearDisabled = !selector && !modifiers

    return (
        <Grid container direction="column" spacing={1}>
            <Grid item xs={12}>
                <Grid container>
                    <Grid item xs>
                        <KeyboardKeyInput
                            selector={selector}
                            modifiers={modifiers}
                            onChange={handleKeyChange}
                        />
                    </Grid>
                    <Grid item>
                        <CmdButton
                            title="clear keys"
                            disabled={clearDisabled}
                            onClick={handleClear}
                            icon={<ClearIcon />}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <pre
                    tabIndex={0}
                    ref={inputButtonRef}
                    onFocus={handleClick}
                    onKeyDown={handleKeyDownReceived}
                >
                    {received.length ? received.join(" + ") : "click to send"}
                </pre>
            </Grid>
        </Grid>
    )
}
