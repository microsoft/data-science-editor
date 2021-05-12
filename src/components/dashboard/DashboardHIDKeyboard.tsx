import React, { useState, KeyboardEvent } from "react"
import { TextField } from "@material-ui/core"
import { HidKeyboardModifiers } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { DashboardServiceProps } from "./DashboardServiceWidget"

export default function DashboardBuzzer(props: DashboardServiceProps) {
    const { service } = props
    const [selector, setSelector] = useState(0)
    const [modifiers, setModifiers] = useState(HidKeyboardModifiers.None)

    console.log({ selector, modifiers: modifiers.toString(16) })

    const handleKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
        console.log({ ev })
        const { altKey, ctrlKey, shiftKey, metaKey } = ev

        const modifiers =
            (altKey && HidKeyboardModifiers.LeftAlt) |
            (metaKey && HidKeyboardModifiers.LeftGUI) |
            (ctrlKey && HidKeyboardModifiers.LeftControl) |
            (shiftKey && HidKeyboardModifiers.LeftShift)
        setModifiers(modifiers)
    }

    const values = []
    if (modifiers & HidKeyboardModifiers.LeftAlt) values.push("Alt")
    if (modifiers & HidKeyboardModifiers.LeftControl) values.push("Ctrl")
    if (modifiers & HidKeyboardModifiers.LeftGUI) values.push("Cmd")
    if (modifiers & HidKeyboardModifiers.LeftShift) values.push("Shift")
    if (modifiers & HidKeyboardModifiers.RightAlt) values.push("Right Alt")
    if (modifiers & HidKeyboardModifiers.RightControl) values.push("Right Ctrl")
    if (modifiers & HidKeyboardModifiers.RightGUI) values.push("Right Cmd")
    if (modifiers & HidKeyboardModifiers.RightShift) values.push("Right Shift")

    if (selector) values.push(selector.toString())

    const value = values.join(" + ")

    return (
        <TextField
            value={value}
            spellCheck={false}
            fullWidth={true}
            helperText={"Type your key combo"}
            onKeyDown={handleKeyDown}
        />
    )
}
