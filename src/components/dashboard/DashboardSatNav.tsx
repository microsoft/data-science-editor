import { Grid } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import React, { useEffect, useState } from "react"
import { SatNavReg } from "../../../jacdac-ts/src/jdom/constants"
import {
    SatNavReadingType,
    SatNavServer,
    watchLocation,
} from "../../../jacdac-ts/src/servers/satnavserver"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"
import useServiceServer from "../hooks/useServiceServer"
import RegisterInput from "../RegisterInput"
import { DashboardServiceProps } from "./DashboardServiceWidget"

export default function DashboardSatNav(props: DashboardServiceProps) {
    const { service, visible } = props

    const server = useServiceServer<SatNavServer>(service)
    const positionRegister = useRegister(service, SatNavReg.Position)
    const enabledRegister = useRegister(service, SatNavReg.Enabled)

    const [geoUnmount, setGeoUnmount] = useState<{ unmount: () => void }>(
        undefined
    )
    useEffect(() => () => geoUnmount?.unmount?.(), [geoUnmount])
    const handleUnuseMyLocationClick = () => {
        geoUnmount?.unmount?.()
        setGeoUnmount(undefined)
    }
    const handleUseMyLocationClick = () => {
        const unmount = watchLocation(server)
        setGeoUnmount(unmount ? { unmount } : undefined)
        enabledRegister.sendSetBoolAsync(true, true)
    }

    const [time, latitude, longitude, accuracy, altitude, altitudeAccuracy] =
        useRegisterUnpackedValue<SatNavReadingType>(positionRegister, props)

    console.log({ geoUnmount })
    return (
        <Grid container spacing={1}>
            {server && (
                <Grid item xs={12}>
                    <Button
                        variant="outlined"
                        onClick={
                            geoUnmount
                                ? handleUnuseMyLocationClick
                                : handleUseMyLocationClick
                        }
                    >
                        {geoUnmount ? "Stop my location" : "Use my location"}
                    </Button>
                </Grid>
            )}
            <Grid item xs={12}>
                <RegisterInput
                    register={enabledRegister}
                    showRegisterName={true}
                    visible={visible}
                />
            </Grid>
            {latitude !== undefined && (
                <Grid item xs={12}>
                    latitude, longitude: {latitude}, {longitude}, ±{accuracy}m
                </Grid>
            )}
            {altitude !== undefined && altitudeAccuracy !== 0 && (
                <Grid item xs={12}>
                    altitude: {altitude}, ±{altitudeAccuracy}m
                </Grid>
            )}
        </Grid>
    )
}
