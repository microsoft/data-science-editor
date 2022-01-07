import React, { ChangeEvent, useCallback, useEffect, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    Badge,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { useId } from "react-use-id-hook"
import SettingsIcon from "@mui/icons-material/Settings"
import CmdButton from "../CmdButton"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import {
    WifiAPFlags,
    WifiCmd,
    WifiReg,
    WifiEvent,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import JDService from "../../../jacdac-ts/src/jdom/service"
import { toHex, unique } from "../../../jacdac-ts/src/jdom/utils"
import useInterval from "../hooks/useInterval"
import useEvent from "../hooks/useEvent"
import useCommandPipeResults from "../hooks/useCommandPipeResults"
import ChipList from "../ui/ChipList"
import useServiceServer from "../hooks/useServiceServer"
import WifiServer from "../../../jacdac-ts/src/servers/wifiserver"
import { Alert, AlertTitle } from "@mui/material"
import { EVENT } from "../../../jacdac-ts/src/jdom/constants"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import WifiIcon from "@mui/icons-material/Wifi"
import WifiOffIcon from "@mui/icons-material/WifiOff"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import SignalWifiStatusbarNullIcon from "@mui/icons-material/SignalWifiStatusbarNull"
import SignalWifiBadIcon from "@mui/icons-material/SignalWifiBad"

// flags, rssi, channel, bssid, ssid
type ScanResult = [WifiAPFlags, number, number, Uint8Array, string]

// priority, flags, ssid
type NetworkResult = [number, number, string]

function toMAC(buffer: Uint8Array) {
    const hex = toHex(buffer, ":")
    return hex
}

function toIP(buffer: Uint8Array): string {
    if (!buffer) return undefined
    if (buffer.length === 4)
        return `${buffer[0]}.${buffer[1]}.${buffer[2]}.${buffer[3]}`
    else return toHex(buffer, ".")
}

function WiFiPasswordDialog(props: {
    open: boolean
    setOpen: (v: boolean) => void
    service: JDService
    ssid: string
}) {
    const { service, open, setOpen, ssid } = props
    const [password, setPassword] = useState("")
    const passwordId = useId()
    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }
    const handleAddNetwork = async () => {
        await service.sendCmdPackedAsync<[string, string]>(
            WifiCmd.AddNetwork,
            [ssid, password || ""],
            true
        )
        setPassword("")
        setOpen(false)
    }
    const handleCancel = () => {
        setPassword("")
        setOpen(false)
    }
    return (
        <Dialog open={open} fullWidth={true} maxWidth={"lg"}>
            <DialogTitleWithClose onClose={handleCancel}>
                Enter WiFi password for {ssid}
            </DialogTitleWithClose>
            <DialogContent>
                <TextField
                    id={passwordId}
                    value={password}
                    label="Password"
                    fullWidth={true}
                    type="password"
                    onChange={handlePasswordChange}
                />
            </DialogContent>
            <DialogActions>
                <CmdButton
                    variant="contained"
                    color="primary"
                    disabled={!service}
                    onClick={handleAddNetwork}
                >
                    Connect
                </CmdButton>
            </DialogActions>
        </Dialog>
    )
}

function NetworkListItem(props: {
    service: JDService
    ssid: string
    network?: NetworkResult
    info?: ScanResult
    connected: boolean
}) {
    const { service, info, network, ssid, connected } = props
    const [open, setOpen] = useState(false)
    const [priority, networkFlags] = network || []
    const [scanFlags, rssi, channel] = info || []
    const [connectionFailed, setConnectionFailed] = useState(false)
    const known = !!network
    const scanned = !!info
    const connectError = ""
    const handleAddNetwork = () => setOpen(true)
    const handleForgetNetwork = async () => {
        setConnectionFailed(false)
        await service.sendCmdPackedAsync<[string]>(WifiCmd.ForgetNetwork, [
            ssid,
        ])
    }
    const handlePriorityChange = async (ev: ChangeEvent<HTMLInputElement>) => {
        const newPriority = parseInt(ev.target.value)
        if (!isNaN(newPriority))
            await service.sendCmdPackedAsync(
                WifiCmd.SetNetworkPriority,
                [newPriority, ssid],
                true
            )
    }
    // hasPassword == requires password
    const connectionFailedEvent = useEvent(service, WifiEvent.ConnectionFailed)
    useEffect(
        () =>
            connectionFailedEvent?.subscribe(EVENT, () => {
                const [failedSsid] = connectionFailedEvent.unpackedValue
                if (failedSsid === ssid) setConnectionFailed(true)
            }),
        [connectionFailedEvent]
    )
    return (
        <>
            <ListItem
                secondaryAction={
                    !known ? (
                        <IconButtonWithTooltip
                            color="primary"
                            disabled={!!connectError}
                            onClick={handleAddNetwork}
                            title="connect"
                        >
                            <AddIcon />
                        </IconButtonWithTooltip>
                    ) : (
                        <CmdButton
                            variant="outlined"
                            color="warning"
                            disabled={!!connectError}
                            onClick={handleForgetNetwork}
                            title={"forget"}
                            icon={<DeleteIcon />}
                        />
                    )
                }
            >
                <ListItemIcon>
                    {connected ? (
                        <Tooltip title="connected">
                            <WifiIcon />
                        </Tooltip>
                    ) : connectionFailed ? (
                        <Tooltip title="connection failed">
                            <SignalWifiBadIcon color="error" />
                        </Tooltip>
                    ) : known && !scanned ? (
                        <Tooltip title="not found">
                            <SignalWifiStatusbarNullIcon />
                        </Tooltip>
                    ) : null}
                </ListItemIcon>
                <ListItemText
                    primary={ssid}
                    secondary={[
                        known && `priority ${priority}`,
                        scanned && `RSSI ${rssi}, channel ${channel}`,
                        scanFlags && WifiAPFlags.WPS && `WPS`,
                    ]
                        .filter(s => !!s)
                        .join(", ")}
                />

                {known && (
                    <TextField
                        sx={{ ml: 1, mr: 1 }}
                        type="number"
                        value={priority}
                        label="priority"
                        onChange={handlePriorityChange}
                    />
                )}
                {open && (
                    <WiFiPasswordDialog
                        service={service}
                        open={open}
                        setOpen={setOpen}
                        ssid={ssid}
                    />
                )}
            </ListItem>
        </>
    )
}

function APList(props: { service: JDService; connectedSsid: string }) {
    const { service, connectedSsid } = props
    const scan = useCallback(
        () => service.sendCmdAsync(WifiCmd.Scan),
        [service]
    )
    const knownNetworksChangedEvent = useEvent(
        service,
        WifiEvent.NetworksChanged
    )
    const knownNetworks = useCommandPipeResults<NetworkResult>(
        service,
        WifiCmd.ListKnownNetworks,
        "i16 i16 s",
        knownNetworksChangedEvent
    )

    // grad scan results
    const scanCompleteEvent = useEvent(service, WifiEvent.ScanComplete)
    const aps = useCommandPipeResults<ScanResult>(
        service,
        WifiCmd.LastScanResults,
        "u32 x[4] i8 u8 b[6] s[33]",
        scanCompleteEvent
    )

    // keep scanning
    useInterval(true, scan, aps?.length ? 30000 : 10000, [service])

    const priority = (s: string) =>
        knownNetworks.find(n => n[2] === s)?.[0] || -Infinity

    const ssids = unique([
        ...(knownNetworks || []).map(kn => kn[2]),
        ...(aps || []).map(ap => ap[4]),
    ]).sort((l, r) => -priority(l) + priority(r))

    return (
        <List>
            {aps !== undefined && !aps.length && (
                <ListItem>
                    <Alert severity="success">Scanning for networks...</Alert>
                </ListItem>
            )}
            {ssids.map(ssid => (
                <NetworkListItem
                    key={ssid}
                    service={service}
                    connected={connectedSsid === ssid}
                    ssid={ssid}
                    network={knownNetworks?.find(kn => kn[2] === ssid)}
                    info={aps?.find(ap => ap[4] === ssid)}
                />
            ))}
        </List>
    )
}

export default function DashboardWifi(props: DashboardServiceProps) {
    const { service } = props
    const [open, setOpen] = useState(false)
    const [connectionFailed, setConnectionFailed] = useState(false)

    const server = useServiceServer<WifiServer>(service)
    const color = server ? "primary" : "secondary"
    const { textPrimary } = useWidgetTheme(color)
    const enabledRegister = service.register(WifiReg.Enabled)
    const ssidRegister = service.register(WifiReg.Ssid)
    const [ssid] = useRegisterUnpackedValue<[string]>(ssidRegister)
    const ipAddressRegister = service.register(WifiReg.IpAddress)
    const [ip] = useRegisterUnpackedValue<[Uint8Array]>(ipAddressRegister)
    const macRegister = service.register(WifiReg.Eui48)
    const [mac] = useRegisterUnpackedValue<[Uint8Array]>(macRegister)
    const lostIpEvent = useEvent(service, WifiEvent.LostIp)
    const gotIpEvent = useEvent(service, WifiEvent.GotIp)
    const connectionFailedEvent = useEvent(service, WifiEvent.ConnectionFailed)
    const connected = !!ip?.length

    const connect = async () => {
        await enabledRegister.sendSetBoolAsync(true)
        await service.sendCmdAsync(WifiCmd.Reconnect)
    }

    const handleConnect = async () => {
        if (connected) await enabledRegister.sendSetBoolAsync(false)
        else {
            setConnectionFailed(false)
            await connect()
        }
    }
    const handleConfigure = () => {
        if (open) setOpen(false)
        else {
            setConnectionFailed(false)
            setOpen(true)
            connect()
        }
    }

    // force register refreshs on various events
    const refreshRegisters = () => {
        ssidRegister.clearGetTimestamp()
        ipAddressRegister.clearGetTimestamp()
    }
    useEffect(
        () => gotIpEvent?.subscribe(EVENT, refreshRegisters),
        [gotIpEvent]
    )
    useEffect(
        () => lostIpEvent?.subscribe(EVENT, refreshRegisters),
        [lostIpEvent]
    )
    useEffect(
        () =>
            connectionFailedEvent?.subscribe(EVENT, () =>
                setConnectionFailed(true)
            ),
        [connectionFailedEvent]
    )
    return (
        <>
            <Grid
                container
                spacing={1}
                style={{ color: textPrimary, minWidth: "16rem" }}
            >
                {server && (
                    <Grid item xs={12}>
                        <Alert severity="warning">
                            <AlertTitle>Test WiFi</AlertTitle>
                            This WiFi does not exist; it is purely for testing
                            purposes.
                        </Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Typography component="span" variant="subtitle2">
                        WiFi
                    </Typography>
                    {(ssid || ip || mac) && (
                        <ChipList>
                            {!!ssid && <Chip color="primary" label={ssid} />}
                            {!!ip && <Chip label={`IP: ${toIP(ip)}`} />}
                            {!!mac && <Chip label={`MAC: ${toMAC(mac)}`} />}
                        </ChipList>
                    )}
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={1} direction="row">
                        <Grid item>
                            <CmdButton
                                trackName="dashboard.wifi.connect"
                                variant="outlined"
                                color="primary"
                                onClick={handleConnect}
                                title={
                                    connected
                                        ? "disconnect WiFi"
                                        : "connect WiFi"
                                }
                                icon={
                                    connected ? <WifiIcon /> : <WifiOffIcon />
                                }
                            />
                        </Grid>
                        <Grid item>
                            <IconButtonWithTooltip
                                onClick={handleConfigure}
                                title={"configure"}
                            >
                                <Badge
                                    color="error"
                                    overlap="circular"
                                    variant="dot"
                                    invisible={!connectionFailed}
                                >
                                    <SettingsIcon />
                                </Badge>
                            </IconButtonWithTooltip>
                        </Grid>
                    </Grid>
                </Grid>
                {open && <APList service={service} connectedSsid={ssid} />}
            </Grid>
        </>
    )
}
