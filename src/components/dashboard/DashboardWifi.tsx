import React, { ChangeEvent, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
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
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
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

// flags, rssi, channel, bssid, ssid
type ScanResult = [WifiAPFlags, number, number, Uint8Array, string]

// priority, flags, ssid
type NetworkResult = [number, number, string]

function ConnectAp(props: { service: JDService; info: ScanResult }) {
    const { service, info } = props
    const [flags, rssi, channel, bssid, ssid] = info
    const [password, setPassword] = useState("")
    const [selected, setSelected] = useState(false)
    const selectId = useId()
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
    const toggleSelected = () => setSelected(!selected)
    const hasPassword = !!(flags & WifiAPFlags.HasPassword)
    const connectError =
        !password && !hasPassword ? "password required" : undefined

    return (
        <ListItem id={selectId} button onClick={toggleSelected}>
            <ListItemText primary={ssid} secondary={`rssi: ${rssi}`} />
            {selected && (
                <>
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
                    <CmdButton
                        variant="contained"
                        color="primary"
                        disabled={!!connectError}
                        onClick={handleAddNetwork}
                    >
                        Connect
                    </CmdButton>
                </>
            )}
        </ListItem>
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
        [scanCompleteEvent.changeId]
    )

    // keep scanning
    useInterval(open, scan, 30000, [service])

    const handleForgetAll = async () =>
        await service.sendCmdAsync(WifiCmd.ForgetAllNetworks, undefined, true)

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={"lg"}
            onClose={handleClose}
        >
            <DialogContent>
                <DialogTitle>
                    Connect to Wifi
                    <CmdButton
                        trackName="dashboard.wifi.scan"
                        onClick={scan}
                        title="scan"
                        autoRun={true}
                    >
                        <RefreshIcon />
                    </CmdButton>
                </DialogTitle>
                <List>
                    {aps.map(ap => (
                        <ConnectAp key={ap[4]} service={service} info={ap} />
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <CmdButton
                    title="forget all networks"
                    icon={<DeleteIcon />}
                    onClick={handleForgetAll}
                >
                    Forget all
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

    const color = "primary"
    const { textPrimary } = useWidgetTheme(color)
    const enabledRegister = service.register(WifiReg.Enabled)
    const enabled = useRegisterBoolValue(enabledRegister, props)
    const connectedRegister = service.register(WifiReg.Connected)
    const connected = useRegisterBoolValue(connectedRegister, props)
    const ssidRegister = service.register(WifiReg.Ssid)
    const [ssid] = useRegisterUnpackedValue<[string]>(ssidRegister)
    const ipAddressRegister = service.register(WifiReg.IpAddress)
    const [ip] = useRegisterUnpackedValue<[Uint8Array]>(ipAddressRegister)
    const macRegister = service.register(WifiReg.Eui48)
    const [mac] = useRegisterUnpackedValue<[Uint8Array]>(macRegister)
    const knownNetworks = useCommandPipeResults<NetworkResult>(
        service,
        WifiCmd.ListKnownNetworks,
        "i16 i16 s"
    )

    const handleEnabledChecked = async (ev, checked: boolean) => {
        if (checked) {
            if (!enabled) await enabledRegister.sendSetBoolAsync(true)
            await service.sendCmdAsync(WifiCmd.Reconnect, undefined, true)
        } else {
            await enabledRegister.sendSetBoolAsync(false, true)
        }
    }
    const handleConfigure = () => setOpen(true)

    return (
        <>
            <Grid
                container
                spacing={1}
                style={{ color: textPrimary, minWidth: "16rem" }}
            >
                <Grid item xs={12}>
                    <Typography component="span" variant="subtitle2">
                        Wifi
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <SwitchWithLabel
                        checked={!!enabled && !!connected}
                        onChange={handleEnabledChecked}
                        disabled={enabled === undefined}
                        label={
                            connected
                                ? ssid || "connected"
                                : enabled
                                ? "idle"
                                : "..."
                        }
                    />
                    <IconButtonWithTooltip
                        title="Configure wifi"
                        onClick={handleConfigure}
                    >
                        <SettingsIcon />
                    </IconButtonWithTooltip>
                </Grid>
                {ip ||
                    (mac && (
                        <Grid item xs={12}>
                            {ip && <Chip label={toHex(ip)} />}
                            {mac && <Chip label={`MAC: ${toHex(mac)}`} />}
                        </Grid>
                    ))}
                <Grid item xs={12}>
                    <List dense={true}>
                        {knownNetworks?.map(([priority, flags, nssid]) => (
                            <NetworkItem
                                currentSsid={ssid}
                                service={service}
                                key={nssid}
                                priority={priority}
                                flags={flags}
                                ssid={ssid}
                            />
                        ))}
                    </List>
                </Grid>
            </Grid>
            <ConnectDialog open={open} setOpen={setOpen} service={service} />
        </>
    )
}
