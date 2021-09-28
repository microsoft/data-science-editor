/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { KeyboardEvent, MouseEvent, useRef, useState } from "react"
import { createStyles, Grid, makeStyles, Typography } from "@material-ui/core"
import {
    HidMouseButton,
    HidMouseButtonEvent,
    HidMouseCmd,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import useServiceServer from "../hooks/useServiceServer"
import HIDMouseServer, {
    renderHidMouseButtons,
} from "../../../jacdac-ts/src/servers/hidmouseserver"
import useChange from "../../jacdac/useChange"
import MouseIcon from "@material-ui/icons/MouseOutlined"

const useStyles = makeStyles(theme =>
    createStyles({
        capture: {
            whiteSpace: "pre-wrap",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "transparent",
            userSelect: "none",
            "&:hover": {
                borderColor: theme.palette.primary.main,
            },
            "&:focus": {
                borderColor: theme.palette.action.active,
            },
        },
    })
)

export default function DashboardHIDMouse(props: DashboardServiceProps) {
    const { service } = props
    const classes = useStyles()
    const preRef = useRef<HTMLPreElement>()
    const server = useServiceServer<HIDMouseServer>(service)
    const [observed, setObserved] = useState("")
    const sendButton = async (
        buttons: HidMouseButton,
        event: HidMouseButtonEvent
    ) => {
        const data = jdpack<[HidMouseButton, HidMouseButtonEvent]>("u16 u8", [
            buttons,
            event,
        ])
        await service.sendCmdAsync(HidMouseCmd.SetButton, data)
    }
    const sendMove = async (dx: number, dy: number) => {
        const data = jdpack<[number, number, number]>("i16 i16 u16", [
            dx,
            dy,
            100,
        ])
        await service.sendCmdAsync(HidMouseCmd.Move, data)
    }
    const sendWheel = async (dy: number) => {
        const data = jdpack<[number, number]>("i16 u16", [dy, 100])
        await service.sendCmdAsync(HidMouseCmd.Wheel, data)
    }
    const serverValue = useChange(server, _ => _?.lastCommand)
    const preview = serverValue || observed
    const handleMouseDown = (ev: MouseEvent<HTMLPreElement>) => {
        const { buttons } = ev
        preRef.current.focus()
        setObserved(`set button ${renderHidMouseButtons(buttons)} down`)
    }
    const handleMouseUp = (ev: MouseEvent<HTMLPreElement>) => {
        const { buttons } = ev
        setObserved(`set button ${renderHidMouseButtons(buttons)} up`)
    }
    const handleKeyDown = async (ev: KeyboardEvent<HTMLPreElement>) => {
        ev.stopPropagation()
        ev.preventDefault()
        const { key } = ev
        switch (key) {
            case "l":
                sendButton(HidMouseButton.Left, HidMouseButtonEvent.Click)
                break
            case "r":
                sendButton(HidMouseButton.Right, HidMouseButtonEvent.Click)
                break
            case "m":
                sendButton(HidMouseButton.Middle, HidMouseButtonEvent.Click)
                break
            case "ArrowRight":
                sendMove(10, 0)
                break
            case "ArrowLeft":
                sendMove(-10, 0)
                break
            case "ArrowUp":
                sendMove(0, -10)
                break
            case "ArrowDown":
                sendMove(0, 10)
                break
            case "w":
                sendWheel(-10)
                break
            case "s":
                sendWheel(10)
                break
        }
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <pre
                    ref={preRef}
                    className={classes.capture}
                    tabIndex={0}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onKeyDown={handleKeyDown}
                >
                    <Grid container spacing={1} direction="row">
                        <Grid item>
                            <MouseIcon fontSize="large" />
                        </Grid>
                        <Grid item xs style={{ userSelect: "none" }}>
                            focus and type l(eft), r(ight), m(iddle) for
                            buttons, arrow keys to move, w(heel up), d(wheel
                            down) for the wheel
                        </Grid>
                    </Grid>
                </pre>
            </Grid>
            {server && preview && (
                <Grid item xs={12}>
                    <Typography variant="caption" component="pre">
                        mouse preview: {preview || "..."}
                    </Typography>
                </Grid>
            )}
        </Grid>
    )
}
