import React from "react"
import { RealTimeClockReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { RealTimeClockReadingType } from "../../../jacdac-ts/src/hosts/realtimeclockservicehost"
import { Typography } from "@material-ui/core"
import LoadingProgress from "../ui/LoadingProgress"

export default function DashboardRealTimeClock(props: DashboardServiceProps) {
    const { service } = props

    const [
        year,
        month,
        dayOfMonth,
        hour,
        min,
        seconds,
    ] = useRegisterUnpackedValue<RealTimeClockReadingType>(
        service.register(RealTimeClockReg.LocalTime),
        props
    )
    if (year === undefined) return <LoadingProgress />
    const t = new Date(year, month - 1, dayOfMonth, hour, min, seconds)
    const date = t.toLocaleDateString()
    const time = t.toLocaleTimeString()
    return (
        <>
            <Typography
                align="center"
                tabIndex={0}
                role="timer"
                aria-label={date}
                variant="body2"
            >
                {date}
            </Typography>
            <Typography
                align="center"
                tabIndex={0}
                role="timer"
                aria-label={time}
                variant="body1"
            >
                {time}
            </Typography>
        </>
    )
}
