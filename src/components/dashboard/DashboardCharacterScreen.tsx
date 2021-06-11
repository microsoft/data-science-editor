import React, { ChangeEvent, useEffect, useState } from "react"
import {
    CharacterScreenCmd,
    CharacterScreenReg,
    CharacterScreenTextDirection,
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

const useStyles = makeStyles(() =>
    createStyles({
        text: {
            fontFamily: "monospace",
            fontWeight: 100,
        },
        box: {},
    })
)

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
    const [message] = useRegisterUnpackedValue<[string]>(messageRegister, props)
    const [rows] = useRegisterUnpackedValue<[number]>(rowsRegister, props)
    const [columns] = useRegisterUnpackedValue<[number]>(columnsRegister, props)
    const [textDirection] = useRegisterUnpackedValue<[number]>(
        textDirectionRegister,
        props
    )
    const [fieldMessage, setFieldMessage] = useState(message)
    const { textPrimary, background, controlBackground } =
        useWidgetTheme("primary")

    const handleClear = async () => {
        setFieldMessage("")
        await service.sendCmdAsync(CharacterScreenCmd.Clear)
    }
    const handleFieldMessageChange = async (
        ev: ChangeEvent<HTMLTextAreaElement>
    ) => {
        setFieldMessage(ev.target.value)
        await messageRegister.sendSetStringAsync(ev.target.value, true)
    }

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
    const els: JSX.Element[] = []

    let y = mo
    for (let row = 0; row < rows; ++row) {
        let x = mo
        const line = lines[row]
        for (let column = 0; column < columns; ++column) {
            const char = line?.[rtl ? columns - 1 - column : column]
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
                            {char}
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
            <Grid item xs={12}>
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
        </Grid>
    )
}
