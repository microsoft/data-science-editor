import {
    CircularProgress,
    FormControlLabel,
    Grid,
    Typography,
} from "@material-ui/core"
import React from "react"
import { RelayReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import { DashboardServiceProps } from "./DashboardServiceWidget"

export default function DashboardSoilMoisture(props: DashboardServiceProps) {
    const { service } = props
    const closedRegister = useRegister(service, RelayReg.Closed)
    const closed = useRegisterBoolValue(closedRegister, props)

    const handleClose = (event: unknown, checked) =>
        closedRegister?.sendSetBoolAsync(checked, true)

    if (closed === undefined) return <CircularProgress />

    return (
        <Grid container spacing={1} direction="row" alignItems="center">
            <Grid item>
                <Typography variant="subtitle1">open (NO)</Typography>
            </Grid>
            <Grid item>
                <SwitchWithLabel
                    label="closed (NC)"
                    checked={closed}
                    onChange={handleClose}
                />
            </Grid>
        </Grid>
    )
}
