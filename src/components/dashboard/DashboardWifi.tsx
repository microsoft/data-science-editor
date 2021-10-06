import React, { ChangeEvent, useEffect, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    TextField,
    Typography,
} from "@material-ui/core"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { useId } from "react-use-id-hook"
import SettingsIcon from "@material-ui/icons/Settings"
import CmdButton from "../CmdButton"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import {
    WifiAPFlags,
    WifiCmd,
    WifiReg,
    WifiEvent,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import JDService from "../../../jacdac-ts/src/jdom/service"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import RefreshIcon from "@material-ui/icons/Refresh"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import useInterval from "../hooks/useInterval"
import useEvent from "../hooks/useEvent"
import useCommandPipeResults from "../hooks/useCommandPipeResults"
import DeleteIcon from "@material-ui/icons/Delete"
import { Button } from "gatsby-theme-material-ui"
import ChipList from "../ui/ChipList"
import useServiceProvider from "../hooks/useServiceProvider"
import useServiceServer from "../hooks/useServiceServer"
import WifiServer from "../../../jacdac-ts/src/servers/wifiserver"
import { Alert, AlertTitle } from "@material-ui/lab"
import { EVENT } from "../../../jacdac-ts/src/jdom/constants"

// flags, rssi, channel, bssid, ssid
type ScanResult = [WifiAPFlags, number, number, Uint8Array, string]

// priority, flags, ssid
type NetworkResult = [number, number, string]

function ConnectAp(props: { service: JDService; info: ScanResult }) {
    const { service, info } = props
    const [flags, rssi, channel, bssid, ssid] = info
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
    }
    const hasPassword = !!(flags & WifiAPFlags.HasPassword)
    const connectError = !hasPassword ? "password required" : undefined

    return (
        <Card>
            <CardHeader title={ssid} />
            <CardContent>
                {!hasPassword && (
                    <TextField
                        id={passwordId}
                        value={password}
                        label="Password"
                        fullWidth={true}
                        type="password"
                        required={!hasPassword}
                        helperText={connectError}
                        onChange={handlePasswordChange}
                    />
                )}
            </CardContent>
            <CardActions>
                <CmdButton
                    variant="contained"
                    color="primary"
                    disabled={!connectError}
                    onClick={handleAddNetwork}
                >
                    Connect
                </CmdButton>
            </CardActions>
        </Card>
    )
}

function ConnectDialog(props: {
    open: boolean
    setOpen: (v: boolean) => void
    service: JDService
}) {
    const { open, setOpen, service } = props
    const handleClose = () => setOpen(false)
    const scan = () => service.sendCmdAsync(WifiCmd.Scan)

    // grad scan results
    const scanCompleteEvent = useEvent(service, WifiEvent.ScanComplete)
    const aps = useCommandPipeResults<ScanResult>(
        service,
        WifiCmd.LastScanResults,
        "u32 x[4] i8 u8 b[6] s[33]",
        scanCompleteEvent
    )

    // keep scanning
    useInterval(open, scan, 30000, [service])

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={"lg"}
            onClose={handleClose}
        >
            <DialogContent>
                <DialogTitle>Connect to Wifi</DialogTitle>
                <Grid container spacing={1}>
                    {aps.map(ap => (
                        <Grid item xs={12} key={ap[4]}>
                            <ConnectAp service={service} info={ap} />
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions>
                <CmdButton
                    trackName="dashboard.wifi.scan"
                    onClick={scan}
                    title="scan"
                    autoRun={true}
                    icon={<RefreshIcon />}
                >
                    Scan
                </CmdButton>
            </DialogActions>
        </Dialog>
    )
}

function NetworkItem(props: {
    currentSsid: string
    service: JDService
    priority: number
    flags: WifiAPFlags
    ssid: string
}) {
    const { currentSsid, service, priority, flags, ssid } = props
    const handleDelete = async () =>
        await service.sendCmdPackedAsync(WifiCmd.ForgetNetwork, [ssid])
    return (
        <ListItem selected={currentSsid === ssid}>
            <ListItemText primary={ssid} secondary={priority} />
            <ListItemSecondaryAction>
                <CmdButton
                    onClick={handleDelete}
                    icon={<DeleteIcon />}
                    title="delete"
                />
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default function DashboardWifi(props: DashboardServiceProps) {
    const { service } = props
    const [open, setOpen] = useState(false)

    const server = useServiceServer<WifiServer>(service)
    const color = server ? "primary" : "secondary"
    const { textPrimary } = useWidgetTheme(color)
    const enabledRegister = service.register(WifiReg.Enabled)
    const connectedRegister = service.register(WifiReg.Connected)
    const connected = useRegisterBoolValue(connectedRegister, props)
    const ssidRegister = service.register(WifiReg.Ssid)
    const [ssid] = useRegisterUnpackedValue<[string]>(ssidRegister)
    const ipAddressRegister = service.register(WifiReg.IpAddress)
    const [ip] = useRegisterUnpackedValue<[Uint8Array]>(ipAddressRegister)
    const macRegister = service.register(WifiReg.Eui48)
    const [mac] = useRegisterUnpackedValue<[Uint8Array]>(macRegister)
    const lostIpEvent = useEvent(service, WifiEvent.LostIp)
    const gotIpEvent = useEvent(service, WifiEvent.GotIp)
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

    const handleConnect = async () => {
        if (connected) await enabledRegister.sendSetBoolAsync(false)
        else await service.sendCmdAsync(WifiCmd.Reconnect, undefined, true)
    }
    const handleConfigure = () => setOpen(true)
    const handleForgetAll = async () =>
        await service.sendCmdAsync(WifiCmd.ForgetAllNetworks, undefined, true)

    // force register refreshs on various events
    const refreshRegisters = () => {
        connectedRegister.clearGetTimestamp()
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
                            {!!ssid && <Chip label={ssid} />}
                            {!!ip && <Chip label={`IP: ${toHex(ip)}`} />}
                            {!!mac && <Chip label={`MAC: ${toHex(mac)}`} />}
                        </ChipList>
                    )}
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="caption">
                        Known networks ({knownNetworks?.length || 0})
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <List dense={true}>
                        {knownNetworks?.map(([priority, flags, nssid]) => (
                            <NetworkItem
                                currentSsid={ssid}
                                service={service}
                                key={nssid}
                                priority={priority}
                                flags={flags}
                                ssid={nssid}
                            />
                        ))}
                    </List>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={1} direction="row">
                        <Grid item>
                            <CmdButton
                                trackName="dashboard.wifi.connect"
                                variant="contained"
                                color="primary"
                                onClick={handleConnect}
                            >
                                {connected ? "Disconnect" : "Connect"}
                            </CmdButton>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                startIcon={<SettingsIcon />}
                                onClick={handleConfigure}
                                title="configure"
                            >
                                Configure
                            </Button>
                        </Grid>
                        <Grid item>
                            <CmdButton
                                variant="outlined"
                                trackName="dashboard.wifi.forgetall"
                                title="forget all networks"
                                icon={<DeleteIcon />}
                                onClick={handleForgetAll}
                            >
                                Forget all
                            </CmdButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <ConnectDialog open={open} setOpen={setOpen} service={service} />
        </>
    )
}
