import React, { ChangeEvent, useEffect, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    List,
    ListItem,
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
import { arrayConcatMany, toHex } from "../../../jacdac-ts/src/jdom/utils"
import RefreshIcon from "@material-ui/icons/Refresh"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import useInterval from "../hooks/useInterval"
import useEvent from "../hooks/useEvent"
import useEventRaised from "../../jacdac/useEventRaised"
import { EVENT } from "../../../jacdac-ts/src/jdom/constants"
interface ScanResult {
    flags: WifiAPFlags
    rssi: number
    channel: number
    bssid: Uint8Array
    ssid: string
}

function ConnectAp(props: { service: JDService; info: ScanResult }) {
    const { service, info } = props
    const { ssid, flags, rssi } = info
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
    const [aps, setAps] = useState<ScanResult[]>([])
    const handleClose = () => setOpen(false)
    const scan = () => service.sendCmdAsync(WifiCmd.Scan)
    const updateScanResults = async mounted => {
        const res = await service.receiveWithInPipe<
            [WifiAPFlags, number, number, Uint8Array, string][]
        >(WifiCmd.LastScanResults, "u32 x[4] i8 u8 b[6] s[33]")
        if (!mounted()) return

        const newAps: ScanResult[] = arrayConcatMany(res)
            .map(([flags, rssi, channel, bssid, ssid]) => ({
                flags,
                rssi,
                channel,
                bssid,
                ssid,
            }))
            .sort((l, r) => l.rssi - r.rssi)
        setAps(newAps || [])
    }

    // keep scanning
    useInterval(open, scan, 30000, [service])
    // refresh on scan update
    const scanCompleteEvent = useEvent(service, WifiEvent.ScanComplete)
    useEffect(
        () => scanCompleteEvent.subscribe(EVENT, () => updateScanResults),
        [scanCompleteEvent]
    )

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
                        <ConnectAp key={ap.ssid} service={service} info={ap} />
                    ))}
                </List>
            </DialogContent>
        </Dialog>
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

    const handleEnabledChecked = async (ev, checked: boolean) => {
        if (checked) {
            if (!enabled) await enabledRegister.sendSetBoolAsync(true)
            await service.sendCmdPackedAsync(WifiCmd.Reconnect)
        } else {
            // shut off
            await enabledRegister.sendSetBoolAsync(false)
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
                        checked={enabled && connected}
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
            </Grid>
            <ConnectDialog open={open} setOpen={setOpen} service={service} />
        </>
    )
}
