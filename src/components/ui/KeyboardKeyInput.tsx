import React, { useEffect, useRef } from "react"
import { createStyles, makeStyles } from "@material-ui/core"
import { HidKeyboardModifiers } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"

const selectors = {
    a: 0x04,
    b: 0x05,
    c: 0x06,
    d: 0x07,
    e: 0x08,
    f: 0x09,
    g: 0x0a,
    h: 0x0b,
    i: 0x0c,
    j: 0x0d,
    k: 0x0e,
    l: 0x0f,
    m: 0x10,
    n: 0x11,
    o: 0x12,
    p: 0x13,
    q: 0x14,
    r: 0x15,
    s: 0x16,
    t: 0x17,
    u: 0x18,
    v: 0x19,
    w: 0x1a,
    x: 0x1b,
    y: 0x1c,
    z: 0x1d,

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

    "!": 0x1e,
    "@": 0x1f,
    "#": 0x20,
    $: 0x21,
    "%": 0x22,
    "^": 0x23,
    "&": 0x24,
    "*": 0x25,
    "(": 0x26,
    ")": 0x27,

    enter: 0x28,
    escape: 0x29,
    backspace: 0x2a,
    tab: 0x2b,
    " ": 0x2c,
    "-": 0x2d,
    _: 0x2d,
    "=": 0x2e,
    "+": 0x2e,
    "[": 0x2f,
    "{": 0x2f,
    "]": 0x30,
    "}": 0x30,
    "\\": 0x31,
    "|": 0x31,
    // non-US #
    "~": 0x32,
    ";": 0x33,
    ":": 0x33,
    "'": 0x34,
    '"': 0x34,
    // grave accent tilde
    ",": 0x36,
    "<": 0x37,
    ".": 0x37,
    ">": 0x37,
    "/": 0x38,
    "?": 0x38,
    capslock: 0x39,
    f1: 0x3a,
    f2: 0x3b,
    f3: 0x3c,
    f4: 0x3d,
    f5: 0x3e,
    f6: 0x3f,
    f7: 0x40,
    f8: 0x41,
    f9: 0x42,
    f10: 0x43,
    f11: 0x44,
    f12: 0x45,
    printscreen: 0x46,
    scrolllock: 0x47,
    pause: 0x48,
    insert: 0x49,
    home: 0x4a,
    pageup: 0x4b,
    delete: 0x4c,
    end: 0x4d,
    pagedown: 0x4e,
    arrowright: 0x4f,
    arrowleft: 0x50,
    arrowdown: 0x51,
    arrowup: 0x52,
    numlock: 0x53,
    numpaddivide: 0x54,
    numpadmultiply: 0x55,
    numpadsubstract: 0x56,
    numpadadd: 0x57,
    numpadenter: 0x58,
    numpad1: 0x59,
    numpad2: 0x5a,
    numpad3: 0x5b,
    numpad4: 0x5c,
    numpad5: 0x5d,
    numpad6: 0x5e,
    numpad7: 0x5f,
    numpad8: 0x60,
    numpad9: 0x61,
    numpad0: 0x62,
    numpaddecimal: 0x63,
    numpadequal: 0x67,
    f13: 0x68,
    f14: 0x69,
    f15: 0x6a,
    f16: 0x6b,
    f17: 0x6c,
    f18: 0x6d,
    f19: 0x6e,
    f20: 0x6f,
    f21: 0x70,
    f22: 0x71,
    f23: 0x72,
    f24: 0x73,
    execute: 0x74,
    help: 0x75,
    contextmenu: 0x76,
    select: 0x77,
    stop: 0x78,
    again: 0x79,
    undo: 0x7a,
    cut: 0x7b,
    copy: 0x7c,
    paste: 0x7d,
    find: 0x7e,
    mute: 0x7f,
    volumeup: 0x80,
    volumedown: 0x81,

    numpadcomma: 0x85,
}
const reverseSelectors: { [index: number]: string } = Object.keys(
    selectors
).reduce((r, key) => {
    if (!r[selectors[key]]) r[selectors[key]] = key
    return r
}, {})
const modifierCodes = {
    controlleft: HidKeyboardModifiers.LeftControl,
    altleft: HidKeyboardModifiers.LeftAlt,
    shiftleft: HidKeyboardModifiers.LeftShift,
    metaleft: HidKeyboardModifiers.LeftGUI,

    controlright: HidKeyboardModifiers.RightControl,
    altright: HidKeyboardModifiers.RightAlt,
    shiftright: HidKeyboardModifiers.RightShift,
    metaright: HidKeyboardModifiers.RightGUI,
}

const useStyles = makeStyles(theme =>
    createStyles({
        capture: {
            cursor: "pointer",
            "&:hover": {
                borderColor: theme.palette.primary.main,
            },
            "&:focus": {
                borderColor: theme.palette.action.active,
            },
        },
        buttonSelected: {
            background: `${theme.palette.primary.dark} !important`,
            color: "white !important",
        },
    })
)

export function renderKey(selector: number, modifiers: HidKeyboardModifiers) {
    const flags = [
        "controlleft",
        "shiftleft",
        "altleft",
        "metaleft",
        "controlright",
        "shiftright",
        "altright",
        "metaright",
    ]
    const values = []
    flags.forEach((flag, i) => {
        if (modifiers & (1 << i)) {
            values.push(`{${flag}}`)
        }
    })
    const sel = reverseSelectors[selector]
    if (sel !== undefined) values.push(sel.length > 1 ? `{${sel}}` : sel)
    const value = values.filter(v => !!v).join(" ")
    return value
}

export default function KeyboardKeyInput(props: {
    selector: number
    modifiers: HidKeyboardModifiers
    onChange: (newSelector: number, newModifiers: HidKeyboardModifiers) => void
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keyboardRef = useRef<any>()
    const { selector, modifiers, onChange } = props
    const classes = useStyles()

    const layout = {
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
            "{tab} q w e r t y u i o p [ ] \\",
            "{capslock} a s d f g h j k l ; ' {enter}",
            "{shiftleft} z x c v b n m , . / {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright}",
        ],
    }
    const display = {
        "{escape}": "esc ⎋",
        "{tab}": "tab ⇥",
        "{backspace}": "backspace ⌫",
        "{enter}": "enter ↵",
        "{capslock}": "caps lock ⇪",
        "{shiftleft}": "shift ⇧",
        "{shiftright}": "shift ⇧",
        "{controlleft}": "ctrl ⌃",
        "{controlright}": "ctrl ⌃",
        "{altleft}": "alt ⌥",
        "{altright}": "alt ⌥",
        "{metaleft}": "cmd ⌘",
        "{metaright}": "cmd ⌘",
    }
    const handleKeyboardKeyPress = (code: string) => {
        code = code.toLowerCase().replace(/[{}]/g, "")
        let newSelector = selector
        let newModifiers = modifiers
        const msel = selectors[code]
        const mcode = modifierCodes[code]
        if (msel) {
            if (msel === selector) newSelector = undefined
            else newSelector = msel
        } else {
            if (mcode) {
                if (newModifiers & mcode) newModifiers &= ~mcode
                else newModifiers |= mcode
            }
        }
        onChange(newSelector, newModifiers)
    }

    // todo: render value to simple-keyboard selectors
    const value = renderKey(selector, modifiers)
    useEffect(() => {
        keyboardRef.current?.addButtonTheme(value, classes.buttonSelected)
        return () =>
            keyboardRef.current?.removeButtonTheme(
                value,
                classes.buttonSelected
            )
    }, [value])

    return (
        <Keyboard
            keyboardRef={r => (keyboardRef.current = r)}
            onKeyPress={handleKeyboardKeyPress}
            layout={layout}
            display={display}
            mergeDisplay={true}
        />
    )
}
