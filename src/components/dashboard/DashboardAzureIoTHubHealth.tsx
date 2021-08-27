import React from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { Grid, Switch, Typography } from "@material-ui/core"
import useChange from "../../jacdac/useChange"
import useServiceClient from "../../jacdac/useServiceClient"
import AzureIoTHubHealthClient from "../../../jacdac-ts/src/clients/azureiothubhealthclient"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { AzureIotHubHealthConnectionStatus } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useId } from "react-use-id-hook"

export default function DashboardAzureIoTHubHealth(
    props: DashboardServiceProps
) {
    const { service } = props
    const connectId = useId()

    const client = useServiceClient(
        service,
        () => new AzureIoTHubHealthClient(service)
    )
    const hubName = useChange(client, _ => _?.hubName)
    const connectionStatus = useChange(client, _ => _?.connectionStatus)
    const color = "primary"
    const { textPrimary } = useWidgetTheme(color)
    const connected =
        connectionStatus === AzureIotHubHealthConnectionStatus.Connected

    return (
        <Grid
            container
            spacing={1}
            style={{ color: textPrimary, minWidth: "16rem" }}
        >
            <Grid item xs={12}>
                <Typography component="span" variant="subtitle1">
                    hub: {hubName}
                </Typography>
                <Switch checked={connected} aria-labelledby={connectId} />
                <label className=".no-pointer-events" id={connectId}>
                    {AzureIotHubHealthConnectionStatus[connectionStatus]}
                </label>
            </Grid>
        </Grid>
    )
}
