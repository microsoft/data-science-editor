import React, { ChangeEvent, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    List,
    ListItem,
    ListItemText,
    Switch,
    TextField,
    Typography,
} from "@material-ui/core"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { useId } from "react-use-id-hook"
import SettingsIcon from "@material-ui/icons/Settings"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import CmdButton from "../CmdButton"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import {
    WifiAPFlags,
    WifiCmd,
    WifiReg,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import JDService from "../../../jacdac-ts/src/jdom/service"
import useMounted from "../hooks/useMounted"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import RefreshIcon from "@material-ui/icons/Refresh"
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
    const handleConnect = async () => {
        await service.sendCmdPackedAsync<[string, string]>(
            WifiCmd.Connect,
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
                        onClick={handleConnect}
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
    const mounted = useMounted()

    const handleClose = () => setOpen(false)
    const startScan = async () => {
        const res = await service.receiveWithInPipe<
            [WifiAPFlags, number, number, Uint8Array, string][]
        >(WifiCmd.Scan, "u32 x[4] i8 u8 b[6] s[33]")
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
                    <CmdButton onClick={startScan} title="scan" autoRun={true}>
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
    const connectId = useId()

    const color = "primary"
    const { textPrimary } = useWidgetTheme(color)
    const connectedRegister = service.register(WifiReg.Connected)
    const connected = useRegisterBoolValue(connectedRegister, props)
    const handleConnectionClick = () => setOpen(true)
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
                    <Switch checked={connected} aria-labelledby={connectId} />
                    <label className=".no-pointer-events" id={connectId}>
                        {connected ? "connected" : "..."}
                    </label>
                    <IconButtonWithTooltip
                        title="Connect to wifi"
                        onClick={handleConnectionClick}
                    >
                        <SettingsIcon />
                    </IconButtonWithTooltip>
                </Grid>
            </Grid>
            <ConnectDialog open={open} setOpen={setOpen} service={service} />
        </>
    )
}
