import React, { useEffect, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import useServiceServer from "../hooks/useServiceServer"
import AzureIoTHubServer, {
    AzureIoTHubMessage,
} from "../../../jacdac-ts/src/servers/azureiothubserver"
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
import { jdpack, jdunpack } from "../../../jacdac-ts/src/jdom/pack"
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward"
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward"
import { EVENT } from "../../../jacdac-ts/src/jdom/constants"
import useWidgetTheme from "../widgets/useWidgetTheme"

const HORIZON = 10

export default function DashboardAzureIoTHub(props: DashboardServiceProps) {
    const { service } = props
    const connectId = useId()

    const [cdMessages, setCDMessages] = useState<AzureIoTHubMessage[]>([])

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
    const connectedEvent = useEvent(service, AzureIotHubEvent.Connected)
    const disconnectedEvent = useEvent(service, AzureIotHubEvent.Disconnected)
    const messageEvent = useEvent(service, AzureIotHubEvent.Message)

    useChange(connectedEvent, () => connectionStatusRegister?.refresh())
    useChange(disconnectedEvent, () => connectionStatusRegister?.refresh())

    // sniff cloud-to-device events
    useEffect(
        () =>
            messageEvent?.subscribe(EVENT, () => {
                const { data, lastDataTimestamp: timestamp } = messageEvent
                if (!data) return
                const [body] = jdunpack<[string]>(messageEvent.data, "s")
                setCDMessages(prevMsgs => {
                    const newMsgs = prevMsgs.slice(0, HORIZON - 1)
                    newMsgs.unshift({ timestamp, body })
                    return newMsgs
                })
            }),
        [messageEvent]
    )

    const connected = connectionStatus === "ok"
    const server = useServiceServer<AzureIoTHubServer>(service)
    const color = server ? "secondary" : "primary"
    const { textPrimary } = useWidgetTheme(color)
    const deviceToCloudMessages = useChange(
        server,
        _ => _?.deviceToCloudMessages
    )

    const handleConnect = async () => {
        await service.sendCmdAsync(
            connected ? AzureIotHubCmd.Disconnect : AzureIotHubCmd.Connect
        )
    }
    const handleSendCloudMessage = async () =>
        server.emitMessage(
            JSON.stringify({
                timestamp: service.device.bus.timestamp,
                message: "hello from cloud",
            })
        )
    const handleSendDeviceMessage = async () => {
        await service.sendCmdAsync(
            AzureIotHubCmd.SendMessage,
            jdpack<[string]>("s", [
                JSON.stringify({
                    timestamp: service.device.bus.timestamp,
                    message: "hello from device",
                }),
            ])
        )
    }

    return (
        <Grid
            container
            spacing={1}
            style={{ color: textPrimary, minWidth: "16rem" }}
        >
            <Grid item xs={12}>
                <Typography component="span" variant="subtitle1">
                    hub: {hubName}, device: {deviceId}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Switch
                    checked={connected}
                    aria-labelledby={connectId}
                    onClick={handleConnect}
                />
                <label className=".no-pointer-events" id={connectId}>
                    {connected ? "connected" : "disconnected"}{" "}
                </label>
                {server && (
                    <CmdButton
                        title="Send cloud to device message"
                        icon={<ArrowDownwardIcon />}
                        onClick={handleSendCloudMessage}
                        disabled={!connected}
                    />
                )}
                <CmdButton
                    title="Send device to cloud message"
                    icon={<ArrowUpwardIcon />}
                    onClick={handleSendDeviceMessage}
                    disabled={!connected}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="caption">
                    cloud to device messages
                </Typography>
                <pre>{cdMessages?.map(m => m.body).join("\n")}</pre>
            </Grid>
            {deviceToCloudMessages && (
                <Grid item xs={12}>
                    <Typography variant="caption">
                        device to cloud messages
                    </Typography>
                    <pre>
                        {deviceToCloudMessages.map(m => m.body).join("\n")}
                    </pre>
                </Grid>
            )}
        </Grid>
    )
}
