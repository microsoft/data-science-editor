import { CircularProgress, Grid, Typography } from "@mui/material"
import React, { CSSProperties } from "react"
import { RelayReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"
import useServiceServer from "../hooks/useServiceServer"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { DashboardServiceProps } from "./DashboardServiceWidget"

export default function DashboardRelay(props: DashboardServiceProps) {
    const { service } = props
    const closedRegister = useRegister(service, RelayReg.Closed)
    const closed = useRegisterBoolValue(closedRegister, props)
    const server = useServiceServer(service)
    const color = server ? "secondary" : "primary"
    const { textPrimary } = useWidgetTheme(color)

    const handleClose = (event: unknown, checked) =>
        closedRegister?.sendSetBoolAsync(checked, true)

    if (closed === undefined) return <CircularProgress />

    const labelStyle: CSSProperties = {
        color: textPrimary,
    }
    return (
        <Grid container spacing={1} direction="row" alignItems="center">
            <Grid item>
                <Typography variant="subtitle1" style={labelStyle}>
                    open
                </Typography>
            </Grid>
            <Grid item>
                <SwitchWithLabel
                    label="closed"
                    checked={closed}
                    onChange={handleClose}
                    labelStyle={labelStyle}
                />
            </Grid>
        </Grid>
    )
}
