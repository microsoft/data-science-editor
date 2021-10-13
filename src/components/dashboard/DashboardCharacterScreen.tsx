import React, { ChangeEvent, useEffect, useState } from "react"
import {
    CharacterScreenCmd,
    CharacterScreenReg,
    CharacterScreenTextDirection,
    CharacterScreenVariant,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import SvgWidget from "../widgets/SvgWidget"
import { createStyles, Grid, makeStyles, TextField } from "@material-ui/core"
import useWidgetTheme from "../widgets/useWidgetTheme"
import LoadingProgress from "../ui/LoadingProgress"
import useRegister from "../hooks/useRegister"
import CmdButton from "../CmdButton"
import ClearIcon from "@material-ui/icons/Clear"
import EditIcon from "@material-ui/icons/Edit"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

const useStyles = makeStyles(() =>
    createStyles({
        text: {
            fontFamily: "monospace",
            fontWeight: 100,
        },
        box: {},
    })
)

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
    const classes = useStyles()
    const messageRegister = useRegister(service, CharacterScreenReg.Message)
    const rowsRegister = useRegister(service, CharacterScreenReg.Rows)
    const columnsRegister = useRegister(service, CharacterScreenReg.Columns)
    const textDirectionRegister = useRegister(
        service,
        CharacterScreenReg.TextDirection
    )
    const variantRegister = useRegister(service, CharacterScreenReg.Variant)
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
    const [fieldMessage, setFieldMessage] = useState(message)
    const { textPrimary, background, controlBackground } =
        useWidgetTheme("primary")

    const handleClear = async mounted => {
        await service.sendCmdAsync(CharacterScreenCmd.Clear, undefined, true)
        if (!mounted()) return
        setFieldMessage("")
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

    const cw = 8
    const ch = 10
    const m = 1
    const mo = 2
    const fs = 8

    const rtl = textDirection === CharacterScreenTextDirection.RightToLeft
    const w = columns * (cw + m) - m + 2 * mo
    const h = rows * (ch + m) - m + 2 * mo

    const lines = (message || "").split(/\n/g)
    const converter: (s: string) => string =
        variant === CharacterScreenVariant.Braille ? brailify : s => s
    const els: JSX.Element[] = []

    let y = mo
    for (let row = 0; row < rows; ++row) {
        let x = mo
        const line = lines[row]
        for (let column = 0; column < columns; ++column) {
            const char = line?.[rtl ? columns - 1 - column : column]
            const dchar = converter(char)
            els.push(
                <g key={`${row}-${column}`}>
                    <rect
                        x={x}
                        y={y}
                        width={cw}
                        height={ch}
                        className={classes.box}
                        fill={controlBackground}
                    />
                    {char && (
                        <text
                            x={x + cw / 2}
                            y={y + ch - fs / 3}
                            textAnchor="middle"
                            fontSize={fs}
                            className={classes.text}
                            fill={textPrimary}
                            aria-label={char}
                        >
                            {dchar}
                        </text>
                    )}
                </g>
            )
            x += cw + m
        }

        y += ch + m
    }
    return (
        <Grid container spacing={1}>
            {edit && (
                <Grid item xs={12}>
                    <Grid container spacing={1}>
                        <Grid item xs>
                            <TextField
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
                <SvgWidget
                    tabIndex={0}
                    title={`character screen displaying "${message}"`}
                    width={w}
                    height={h}
                >
                    <>
                        <rect
                            x={0}
                            y={0}
                            width={w}
                            height={h}
                            r={m / 2}
                            fill={background}
                        />
                        {els}
                    </>
                </SvgWidget>
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
