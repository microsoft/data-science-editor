import React, { KeyboardEvent } from "react"
import { createStyles, Grid, makeStyles, Typography } from "@material-ui/core"
import { HidMouseButton, HidMouseButtonEvent, HidMouseCmd } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import useServiceServer from "../hooks/useServiceServer"
import HIDMouseServer from "../../../jacdac-ts/src/servers/hidmouseserver"
import useChange from "../../jacdac/useChange"

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


export default function DashboardHIDMouse(props: DashboardServiceProps) {
    const { service } = props
    const classes = useStyles()
    const server = useServiceServer<HIDMouseServer>(service)
    const sendButton = async (buttons: HidMouseButton, event: HidMouseButtonEvent) => {
        const data = jdpack<[HidMouseButton, HidMouseButtonEvent]>("u16 u8", [buttons, event])
        await service.sendCmdAsync(HidMouseCmd.SetButton, data)
    }
    const sendMove = async (dx: number, dy: number) => {
        const data = jdpack<[number, number, number]>("i16 i16 u16", [dx, dy, 100])
        await service.sendCmdAsync(HidMouseCmd.Move, data)
    }
    const sendWheel = async (dy: number) => {
        const data = jdpack<[number, number]>("i16 u16", [dy, 100])
        await service.sendCmdAsync(HidMouseCmd.Wheel, data)
    }
    const serverValue = useChange(server, _ => _?.lastCommand)
    const value = serverValue || "..."
    const handleKeyDown = async (ev: KeyboardEvent<HTMLInputElement>) => {
        ev.stopPropagation()
        ev.preventDefault()
        const { key } = ev
        console.log({ key })
        switch (key) {
            case "l": sendButton(HidMouseButton.Left, HidMouseButtonEvent.Click); break;
            case "r": sendButton(HidMouseButton.Right, HidMouseButtonEvent.Click); break;
            case "m": sendButton(HidMouseButton.Middle, HidMouseButtonEvent.Click); break;
            case "ArrowRight": sendMove(10, 0); break;
            case "ArrowLeft": sendMove(-10, 0); break;
            case "ArrowUp": sendMove(0, 10); break;
            case "ArrowDown": sendMove(0, -10); break;
            case "w": sendWheel(10); break;
            case "s": sendWheel(-10); break;
        }
    }

    return <Grid container spacing={1}>
        <Grid item>
            <pre
                className={classes.capture}
                tabIndex={0}
                onKeyDown={handleKeyDown}>
                {value || "..."}
            </pre>
            <Typography variant="caption">focus and type l(eft), r(ight), m(iddle) for buttons, arrow keys to move, w(heel up), d(wheel down) for the wheel</Typography>
        </Grid>
        {server && <Grid item xs={12}>
            <Typography variant="caption" component="pre">
                mouse status: {serverValue || "..."}
            </Typography>
        </Grid>}
    </Grid>
}
