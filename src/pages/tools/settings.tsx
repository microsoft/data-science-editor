import React from "react"
import { Link } from "gatsby-theme-material-ui"
import { Grid } from "@material-ui/core"
import { SRV_SETTINGS } from "../../../jacdac-ts/src/jdom/constants"
import ConnectAlert from "../../components/alert/ConnectAlert"
import SettingsCard from "../../components/SettingsCard"
import useServices from "../../components/hooks/useServices"

export default function Page() {
    const services = useServices({ serviceClass: SRV_SETTINGS })

    return (
        <>
            <h1>Device Settings</h1>
            <p>
                Configure settings in a{" "}
                <Link to="/services/settings/">settings</Link> service.
            </p>
            {<ConnectAlert serviceClass={SRV_SETTINGS} />}
            <Grid container spacing={2}>
                {services.map(service => (
                    <Grid key={service.id} item xs={12} lg={6}>
                        <SettingsCard service={service} mutable={true} />
                    </Grid>
                ))}
            </Grid>
        </>
    )
}
