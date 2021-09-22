import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import { createStyles, makeStyles } from "@material-ui/core"
import { HidKeyboardModifiers } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"
import DarkModeContext from "./DarkModeContext"
import { useId } from "react-use-id-hook"
import {
    modifierCodes,
    renderKeyboardKey,
    selectors,
} from "../../../jacdac-ts/src/servers/hidkeyboardserver"
import useMediaQueries from "../hooks/useMediaQueries"

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
        darkKeyboard: {
            backgroundColor: "#333 !important",
            borderColor: "#777 !important",
            color: "white !important",
            "& .hg-button": {
                background: "rgba(0, 0, 0, 0.5) !important",
                color: "white",
            },
            "& .hg-button.buttonSelected": {
                background: `${theme.palette.primary.dark} !important`,
                color: "white !important",
            },
        },
        keyboard: {
            "& .buttonSelected": {
                background: `${theme.palette.primary.dark} !important`,
                color: "white !important",
            },
        },
    })
)

export default function KeyboardKeyInput(props: {
    initialSelector?: number
    initialModifiers?: HidKeyboardModifiers
    selector?: number
    modifiers?: HidKeyboardModifiers
    onChange: (newSelector: number, newModifiers: HidKeyboardModifiers) => void
}) {
    const { initialSelector, initialModifiers, selector, modifiers, onChange } =
        props
    const uncontrolled = useMemo(
        () => selector === undefined || modifiers === undefined,
        []
    )
    const [selector_, setSelector_] = useState<number>(initialSelector || 0)
    const [modifiers_, setModifiters_] = useState<HidKeyboardModifiers>(
        initialModifiers || HidKeyboardModifiers.None
    )
    const { darkMode } = useContext(DarkModeContext)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keyboardRef = useRef<any>()
    const classes = useStyles()
    const theme = `hg-theme-default hg-layout-default ${
        darkMode === "dark" ? classes.darkKeyboard : classes.keyboard
    }`
    const { mobile } = useMediaQueries()
    const layoutName = mobile ? "mobile" : "default"
    const keyboardId = useId()

    const layout = {
        default: [
            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
            "{tab} q w e r t y u i o p [ ] \\",
            "{capslock} a s d f g h j k l ; ' {enter}",
            "{shiftleft} z x c v b n m , . / {shiftright}",
            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright}",
        ],
        mobile: [
            "{escape} {f1} {f2} {f3} {f4} {f5}",
            "{f6} {f7} {f8} {f9} {f10} {f11} {f12}",
            "` 1 2 3 4 5 6",
            "7 8 9 0 - = {backspace}",
            "{tab} q w e r t",
            "y u i o p [ ] \\",
            "{capslock} a s d f g",
            "h j k l ; ' {enter}",
            "{shiftleft} z x c v b",
            "n m , . / {shiftright}",
            "{controlleft} {altleft} {metaleft} {space}",
            "{metaright} {altright}",
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
        let newSelector = selector_
        let newModifiers = modifiers_
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
        setSelector_(newSelector)
        setModifiters_(newModifiers)
        onChange(newSelector, newModifiers)
    }

    // update external values
    useEffect(() => {
        if (selector !== undefined) {
            if (uncontrolled)
                console.warn(`trying to set an uncontrolled selector`)
            setSelector_(selector)
        }
    }, [selector])
    useEffect(() => {
        if (modifiers !== undefined) {
            if (uncontrolled)
                console.warn(`trying to set an uncontrolled modifier`)
            setModifiters_(modifiers)
        }
    }, [modifiers])

    const value = renderKeyboardKey(selector_, modifiers_, false)
    useEffect(() => {
        keyboardRef.current?.addButtonTheme(value, "buttonSelected")
        return () =>
            keyboardRef.current?.removeButtonTheme(value, "buttonSelected")
    }, [value])

    return (
        <Keyboard
            baseClass={keyboardId}
            keyboardRef={r => (keyboardRef.current = r)}
            onKeyPress={handleKeyboardKeyPress}
            layout={layout}
            layoutName={layoutName}
            theme={theme}
            display={display}
            mergeDisplay={true}
        />
    )
}
