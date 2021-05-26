import React, { ReactNode } from "react"
import { HidKeyboardModifiers } from "../../../../jacdac-ts/src/jdom/constants"
import { ReactField } from "./ReactField"
import KeyboardKeyInput, { renderKeyboardKey } from "../../ui/KeyboardKeyInput"

export interface KeyboardFieldValue {
    selector: number
    modifiers: HidKeyboardModifiers
}

export default class KeyboardKeyField extends ReactField<{
    selector: number
    modifiers: HidKeyboardModifiers
}> {
    static KEY = "jacdac_field_keyboard_key"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(options: any) {
        return new KeyboardKeyField(options)
    }

    getText_() {
        const { selector, modifiers } = this.value
        return renderKeyboardKey(selector, modifiers, true)
    }

    renderField(): ReactNode {
        const { selector, modifiers } = this.value
        const handleChange = (
            newSelector: number,
            newModifiers: HidKeyboardModifiers
        ) => {
            this.value = { selector: newSelector, modifiers: newModifiers }
        }
        return (
            <KeyboardKeyInput
                initialSelector={selector}
                initialModifiers={modifiers}
                onChange={handleChange}
            />
        )
    }
}
