import React, { useContext } from "react"
import { Grid } from "@material-ui/core"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context";
import { SRV_SETTINGS } from "../../../jacdac-ts/src/jdom/constants"
import useChange from "../../jacdac/useChange"
import { BusState } from "../../../jacdac-ts/src/jdom/bus"
import ConnectAlert from "../alert/ConnectAlert"
import Alert from "../ui/Alert"
import SettingsCard from "../SettingsCard"

export default function SettingsManager() {
    const { bus, connectionState } = useContext<JacdacContextProps>(JacdacContext)

    const services = useChange(bus, b => b.services({ serviceClass: SRV_SETTINGS }));

    return <>
        {<ConnectAlert serviceClass={SRV_SETTINGS} />}
        {!services.length && connectionState == BusState.Connected && <Alert severity="info">We could not find any device with the settings storage service on the bus!</Alert>}
        <Grid container spacing={2}>
            {services.map(service => <Grid key={service.id} item xs={12}>
                <SettingsCard service={service} mutable={true} />
            </Grid>)}
        </Grid>
    </>
}