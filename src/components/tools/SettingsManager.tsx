import React from "react"
import { Grid } from "@material-ui/core"
import { SRV_SETTINGS } from "../../../jacdac-ts/src/jdom/constants"
import ConnectAlert from "../alert/ConnectAlert"
import SettingsCard from "../SettingsCard"
import useServices from "../hooks/useServices"

export default function SettingsManager() {
    const services = useServices({ serviceClass: SRV_SETTINGS })

    return (
        <>
            <ConnectAlert serviceClass={SRV_SETTINGS} />
            <Grid container spacing={2}>
                {services.map(service => (
                    <Grid key={service.id} item xs={12}>
                        <SettingsCard service={service} mutable={true} />
                    </Grid>
                ))}
            </Grid>
        </>
    )
}
