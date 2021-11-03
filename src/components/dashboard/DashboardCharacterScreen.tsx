import React, { ChangeEvent, useEffect, useState } from "react"
import {
    CharacterScreenCmd,
    CharacterScreenReg,
    CharacterScreenTextDirection,
    CharacterScreenVariant,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { Grid, TextField } from "@mui/material"
import LoadingProgress from "../ui/LoadingProgress"
import useRegister from "../hooks/useRegister"
import CmdButton from "../CmdButton"
import ClearIcon from "@mui/icons-material/Clear"
import EditIcon from "@mui/icons-material/Edit"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import CharacterScreenWidget from "../widgets/CharacterScreenWidget"

// https://en.wikipedia.org/wiki/Braille_ASCII
const BRAILE_CHARACTERS = {
    " ": "⠀", // space bar to dot-0
    "-": "⠤",
    ",": "⠠",
    ";": "⠰",
    ":": "⠱",
    "!": "⠮",
    "?": "⠹",
    ".": "⠨",
    "(": "⠷",
    "[": "⠪",
    "@": "⠈",
    "*": "⠡",
    "/": "⠌",
    "'": "⠄",
    '"': "⠐",
    "\\": "⠳",
    "&": "⠯",
    "%": "⠩",
    "^": "⠘",
    "+": "⠬",
    "<": "⠣",
    ">": "⠜",
    $: "⠫",
    "0": "⠴",
    "1": "⠂",
    "2": "⠆",
    "3": "⠒",
    "4": "⠲",
    "5": "⠢",
    "6": "⠖",
    "7": "⠶",
    "8": "⠦",
    "9": "⠔",
    A: "⠁",
    B: "⠃",
    C: "⠉",
    D: "⠙",
    E: "⠑",
    F: "⠋",
    G: "⠛",
    H: "⠓",
    I: "⠊",
    J: "⠚",
    K: "⠅",
    L: "⠇",
    M: "⠍",
    N: "⠝",
    O: "⠕",
    P: "⠏",
    Q: "⠟",
    R: "⠗",
    S: "⠎",
    T: "⠞",
    U: "⠥",
    V: "⠧",
    W: "⠺",
    X: "⠭",
    Z: "⠵",
    "]": "⠻",
    "#": "⠼",
    Y: "⠽",
    ")": "⠾",
    "=": "⠿",
    _: "⠸",
}
function brailify(s: string) {
    if (!s) return s
    let r = ""
    const su = s.toLocaleUpperCase()
    for (let i = 0; i < su.length; ++i) {
        r += BRAILE_CHARACTERS[su.charAt(i)] || "?"
    }
    return r
}

export default function DashboardCharacterScreen(props: DashboardServiceProps) {
    const { service } = props

    const messageRegister = useRegister(service, CharacterScreenReg.Message)
    const rowsRegister = useRegister(service, CharacterScreenReg.Rows)
    const columnsRegister = useRegister(service, CharacterScreenReg.Columns)
    const textDirectionRegister = useRegister(
        service,
        CharacterScreenReg.TextDirection
    )
    const variantRegister = useRegister(service, CharacterScreenReg.Variant)
    const brightnessRegister = useRegister(
        service,
        CharacterScreenReg.Brightness
    )

    const [edit, setEdit] = useState(false)
    const [message] = useRegisterUnpackedValue<[string]>(messageRegister, props)
    const [rows] = useRegisterUnpackedValue<[number]>(rowsRegister, props)
    const [columns] = useRegisterUnpackedValue<[number]>(columnsRegister, props)
    const [textDirection] = useRegisterUnpackedValue<[number]>(
        textDirectionRegister,
        props
    )
    const [variant] = useRegisterUnpackedValue<[CharacterScreenVariant]>(
        variantRegister,
        props
    )
    const [brightness] = useRegisterUnpackedValue<[number]>(brightnessRegister)

    const [fieldMessage, setFieldMessage] = useState(message)

    const handleClear = async () => {
        setFieldMessage("")
        await service.sendCmdAsync(CharacterScreenCmd.Clear, undefined, true)
    }
    const handleFieldMessageChange = async (
        ev: ChangeEvent<HTMLTextAreaElement>
    ) => {
        setFieldMessage(ev.target.value)
        await messageRegister.sendSetStringAsync(ev.target.value, true)
    }
    const handleEdit = () => setEdit(e => !e)

    // set first value of message
    useEffect(() => {
        if (!fieldMessage && message) setFieldMessage(message)
    }, [message])

    if (rows === undefined || columns === undefined) return <LoadingProgress /> // size unknown

    const converter: (s: string) => string =
        variant === CharacterScreenVariant.Braille ? brailify : s => s
    const cmessage = message.split("").map(converter).join("")
    const rtl = textDirection === CharacterScreenTextDirection.RightToLeft

    return (
        <Grid container spacing={1}>
            {edit && (
                <Grid item xs={12}>
                    <Grid container spacing={1}>
                        <Grid item xs>
                            <TextField
                                label="text"
                                value={fieldMessage}
                                onChange={handleFieldMessageChange}
                                multiline={true}
                                rows={rows || 2}
                                fullWidth={true}
                            />
                        </Grid>
                        <Grid item>
                            <CmdButton
                                title="clear the entire display"
                                onClick={handleClear}
                                icon={<ClearIcon />}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            )}
            <Grid item xs>
                <CharacterScreenWidget
                    rows={rows}
                    columns={columns}
                    rtl={rtl}
                    message={cmessage}
                    disabled={brightness === 0}
                />
            </Grid>
            <Grid item>
                <IconButtonWithTooltip
                    title={!edit ? "show editor" : "hide editor"}
                    onClick={handleEdit}
                >
                    <EditIcon />
                </IconButtonWithTooltip>
            </Grid>
        </Grid>
    )
}
