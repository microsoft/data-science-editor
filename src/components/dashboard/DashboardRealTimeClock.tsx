import React from "react"
import {
    RealTimeClockCmd,
    RealTimeClockReg,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { RealTimeClockReadingType } from "../../../jacdac-ts/src/servers/realtimeclockserver"
import { Grid, Typography } from "@mui/material"
import useRegister from "../hooks/useRegister"
import SyncIcon from "@mui/icons-material/Sync"
import CmdButton from "../CmdButton"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"

export default function DashboardRealTimeClock(props: DashboardServiceProps) {
    const { service } = props

    const localTimeRegister = useRegister(service, RealTimeClockReg.LocalTime)
    const [year, month, dayOfMonth, dayOfWeek, hour, min, seconds] =
        useRegisterUnpackedValue<RealTimeClockReadingType>(
            localTimeRegister,
            props
        )
    const handleSync = async () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const dayOfMonth = now.getDate()
        const dayOfWeek = now.getDay()
        const hour = now.getHours()
        const min = now.getMinutes()
        const second = now.getSeconds()
        await service.sendCmdPackedAsync(RealTimeClockCmd.SetTime, [
            year,
            month,
            dayOfMonth,
            dayOfWeek,
            hour,
            min,
            second,
        ])
    }

    if (year === undefined)
        return <DashboardRegisterValueFallback register={localTimeRegister} />

    const t = new Date(year, month - 1, dayOfMonth, hour, min, seconds)
    const date = t.toLocaleDateString()
    const time = t.toLocaleTimeString()
    return (
        <Grid container spacing={1}>
            <Grid item>
                <Grid container spacing={1} direction="column">
                    <Grid item>
                        <Typography
                            align="left"
                            tabIndex={0}
                            role="timer"
                            aria-label={date}
                            variant="subtitle2"
                        >
                            {date}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography
                            align="center"
                            tabIndex={0}
                            role="timer"
                            aria-label={time}
                            variant="subtitle1"
                        >
                            {time}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <CmdButton
                    title="Sync time"
                    onClick={handleSync}
                    icon={<SyncIcon />}
                />
            </Grid>
        </Grid>
    )
}
