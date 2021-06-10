import React from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import useServiceServer from "../hooks/useServiceServer"
import AzureIoTHubServer from "../../../jacdac-ts/src/servers/azureiothubserver"
import { Grid, Switch, Typography } from "@material-ui/core"
import useRegister from "../hooks/useRegister"
import {
    AzureIotHubCmd,
    AzureIotHubEvent,
    AzureIotHubReg,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { useId } from "react-use-id-hook"
import useEvent from "../hooks/useEvent"
import useChange from "../../jacdac/useChange"
import CmdButton from "../CmdButton"
import AddIcon from "@material-ui/icons/Add"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"

export default function DashboardAzureIoTHub(props: DashboardServiceProps) {
    const { service } = props
    const connectId = useId()

    const hubNameRegister = useRegister(service, AzureIotHubReg.HubName)
    const deviceIdRegister = useRegister(service, AzureIotHubReg.DeviceId)
    const connectionStatusRegister = useRegister(
        service,
        AzureIotHubReg.ConnectionStatus
    )

    const [hubName] = useRegisterUnpackedValue<[string]>(hubNameRegister, props)
    const [deviceId] = useRegisterUnpackedValue<[string]>(
        deviceIdRegister,
        props
    )
    const [connectionStatus] = useRegisterUnpackedValue<[string]>(
        connectionStatusRegister,
        props
    )
    const changeEvent = useEvent(service, AzureIotHubEvent.Change)
    useChange(changeEvent, () => hubNameRegister?.refresh())

    const connected = connectionStatus === "ok"
    const server = useServiceServer<AzureIoTHubServer>(service)
    const messages = useChange(server, _ => _?.messages || [])

    const handleConnect = async () => {
        await service.sendCmdAsync(
            connected ? AzureIotHubCmd.Disconnect : AzureIotHubCmd.Connect
        )
    }

    const handleSendMessage = async () => {
        const msg = {
            timestamp: service.device.bus.timestamp,
        }
        await service.sendCmdAsync(
            AzureIotHubCmd.SendMessage,
            jdpack<[string]>("s", [JSON.stringify(msg)])
        )
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Typography component="span" variant="body1">
                    hub: {hubName}, device: {deviceId}
                </Typography>
                <Switch
                    checked={connected}
                    aria-labelledby={connectId}
                    onClick={handleConnect}
                />
                <label id={connectId}>
                    {connected ? "connected" : "disconnected"}
                </label>
                <CmdButton
                    title="Send timestamp message"
                    icon={<AddIcon />}
                    onClick={handleSendMessage}
                />
            </Grid>
            <Grid item xs={12}>
                <pre>{messages?.map(m => m.body).join("\n")}</pre>
            </Grid>
        </Grid>
    )
}
