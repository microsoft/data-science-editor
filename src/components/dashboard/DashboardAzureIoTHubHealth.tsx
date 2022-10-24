import React, {
    ChangeEvent,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    TextField,
    Typography,
} from "@mui/material"
import useServiceClient from "../../jacdac/useServiceClient"
import { AzureIoTHubHealthClient } from "../../../jacdac-ts/src/clients/azureiothubhealthclient"
import useWidgetTheme from "../widgets/useWidgetTheme"
import {
    AzureIotHubHealthCmd,
    AzureIotHubHealthConnectionStatus,
    AzureIotHubHealthEvent,
    AzureIotHubHealthReg,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useId } from "react"
import SettingsIcon from "@mui/icons-material/Settings"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import CmdButton from "../CmdButton"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import ChipList from "../ui/ChipList"
import useEvent from "../hooks/useEvent"
import useEventCount from "../../jacdac/useEventCount"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"
import ConnectedIcon from "../icons/ConnectedIcon"
import BrainManagerContext from "../brains/BrainManagerContext"
import { BrainManager } from "../brains/braindom"
import useChange from "../../jacdac/useChange"
import useEffectAsync from "../useEffectAsync"

function ConnectionStringDialog(props: {
    open: boolean
    setOpen: (v: boolean) => void
    client: AzureIoTHubHealthClient
}) {
    const { client, open, setOpen } = props
    const [value, setValue] = useState("")
    const connectionStringId = useId()
    const handleCancel = () => {
        setValue("")
        setOpen(false)
    }
    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
    }
    const handleOk = async mounted => {
        await client.setConnectionString(value || "")
        if (!mounted()) return
        setValue("")
        setOpen(false)
    }
    return (
        <Dialog open={open} fullWidth={true} maxWidth={"md"}>
            <DialogTitleWithClose onClose={handleCancel}>
                Enter device connection string
            </DialogTitleWithClose>
            <DialogContent>
                <Typography component="p" variant="caption">
                    Open your IoT Hub in the Azure portal, select IoT Devices,
                    select or create a device, copy the primary or secondary
                    connection string.
                </Typography>
                <TextField
                    sx={{ mt: 2 }}
                    id={connectionStringId}
                    value={value}
                    label="Value"
                    fullWidth={true}
                    type="password"
                    size="small"
                    placeholder="Connection string"
                    onChange={handleValueChange}
                />
            </DialogContent>
            <DialogActions>
                <CmdButton
                    variant="contained"
                    color="primary"
                    disabled={!client}
                    onClick={handleOk}
                >
                    Save
                </CmdButton>
            </DialogActions>
        </Dialog>
    )
}

function BrainManagerConnectionStringDialog(props: {
    open: boolean
    setOpen: (v: boolean) => void
    brainManager: BrainManager
    client: AzureIoTHubHealthClient
}) {
    const { client, open, setOpen, brainManager } = props
    const { device } = client.service
    const { deviceId, shortId } = device
    const brain = useChange(brainManager, _ => _.deviceByDeviceId(deviceId), [
        deviceId,
    ])
    const brainName = useChange(brain, _ => _?.name)
    const [value, setValue] = useState(brainName || shortId)
    const connectionStringId = useId()
    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
    }
    const handleCancel = () => {
        setOpen(false)
    }
    const handleOk = async mounted => {
        await brainManager.registerDevice(device, value)
        if (!mounted()) return
        setOpen(false)
    }
    useEffectAsync(() => brainManager?.refreshDevices(), [brainManager])
    useEffect(() => setValue(brainName), [brainName])

    return (
        <Dialog open={open} fullWidth={true} maxWidth={"md"}>
            <DialogTitleWithClose onClose={handleCancel}>
                Brain Registration
            </DialogTitleWithClose>
            <DialogContent>
                <Typography component="p" variant="caption">
                    Register or update your IoT Hub in the brain manager.
                </Typography>
                <TextField
                    sx={{ mt: 2 }}
                    id={connectionStringId}
                    value={value}
                    label={`Device Name${brainName !== value ? "*" : ""}`}
                    fullWidth={true}
                    size="small"
                    placeholder="Enter a friendly name"
                    onChange={handleValueChange}
                />
            </DialogContent>
            <DialogActions>
                <CmdButton
                    variant="contained"
                    color="primary"
                    disabled={!client || !value}
                    onClick={handleOk}
                >
                    {brain ? "Update" : "Register"}
                </CmdButton>
            </DialogActions>
        </Dialog>
    )
}

export default function DashboardAzureIoTHubHealth(
    props: DashboardServiceProps
) {
    const { service } = props
    const { brainManager } = useContext(BrainManagerContext)
    const [open, setOpen] = useState(false)

    const hubNameRegister = service.register(AzureIotHubHealthReg.HubName)
    const [hubName] = useRegisterUnpackedValue<[string]>(hubNameRegister, props)
    const hubDeviceIdRegister = service.register(
        AzureIotHubHealthReg.HubDeviceId
    )
    const [hubDeviceId] = useRegisterUnpackedValue<[string]>(
        hubDeviceIdRegister,
        props
    )
    const connectionStatusRegister = service.register(
        AzureIotHubHealthReg.ConnectionStatus
    )
    const [connectionStatus] = useRegisterUnpackedValue<
        [AzureIotHubHealthConnectionStatus]
    >(connectionStatusRegister, props)
    const messageSentEvent = useEvent(
        service,
        AzureIotHubHealthEvent.MessageSent
    )
    const messageSent = useEventCount(messageSentEvent)
    const factory = useCallback(srv => new AzureIoTHubHealthClient(srv), [])
    const client = useServiceClient(service, factory)
    const color = "primary"
    const { textPrimary } = useWidgetTheme(color)
    const connected =
        connectionStatus === AzureIotHubHealthConnectionStatus.Connected

    const handleConnect = async () => {
        const cmd = connected
            ? AzureIotHubHealthCmd.Disconnect
            : AzureIotHubHealthCmd.Connect
        await service.sendCmdAsync(cmd)
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
                        Azure IoT Hub
                    </Typography>
                    <ChipList>
                        {hubName && (
                            <Chip
                                color={connected ? "primary" : "default"}
                                label={hubName}
                            />
                        )}
                        {hubDeviceId && (
                            <Chip label={`device: ${hubDeviceId}`} />
                        )}
                        {messageSent !== undefined && (
                            <Chip label={`messages: ${messageSent}`} />
                        )}
                    </ChipList>
                </Grid>
                <Grid item>
                    <CmdButton
                        trackName="dashboard.azureiothealth.connect"
                        variant="outlined"
                        color="primary"
                        onClick={handleConnect}
                        disabled={connectionStatus === undefined}
                        title={
                            AzureIotHubHealthConnectionStatus[
                                connectionStatus
                            ] || "Waiting..."
                        }
                        icon={<ConnectedIcon connected={connected} />}
                    />
                </Grid>
                <Grid item>
                    <IconButtonWithTooltip
                        title="Configure"
                        onClick={handleConfigure}
                    >
                        <SettingsIcon />
                    </IconButtonWithTooltip>
                </Grid>
            </Grid>
            {client && brainManager && (
                <BrainManagerConnectionStringDialog
                    brainManager={brainManager}
                    client={client}
                    open={open}
                    setOpen={setOpen}
                />
            )}
            {client && !brainManager && (
                <ConnectionStringDialog
                    client={client}
                    open={open}
                    setOpen={setOpen}
                />
            )}
        </>
    )
}
