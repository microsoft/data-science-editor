import React, { ChangeEvent, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Switch,
    TextField,
    Typography,
} from "@material-ui/core"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { useId } from "react-use-id-hook"
import SettingsIcon from "@material-ui/icons/Settings"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { Button } from "gatsby-material-ui-components"
import CmdButton from "../CmdButton"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import {
    WifiCmd,
    WifiReg,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import JDService from "../../../jacdac-ts/src/jdom/service"

function ConnectDialog(props: {
    open: boolean
    setOpen: (v: boolean) => void
    service: JDService
}) {
    const { open, setOpen, service } = props
    const [ap, setAp] = useState("")
    const [password, setPassword] = useState("")
    const apId = useId()
    const passwordId = useId()
    const handleCancel = () => {
        setAp("")
        setOpen(false)
    }
    const handleApChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAp(event.target.value)
    }
    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }
    const handleOk = async () => {
        await service.sendCmdPackedAsync<[string, string]>(
            WifiCmd.Connect,
            [ap, password],
            true
        )
        setAp("")
        setPassword("")
        setOpen(false)
    }
    return (
        <Dialog open={open} fullWidth={true} maxWidth={"lg"}>
            <DialogContent>
                <DialogTitle>Wifi</DialogTitle>
                <TextField
                    id={apId}
                    value={ap}
                    label="Network"
                    fullWidth={true}
                    type="text"
                    onChange={handleApChange}
                />
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
                <Button variant="contained" onClick={handleCancel}>
                    Cancel
                </Button>
                <CmdButton
                    variant="contained"
                    color="primary"
                    onClick={handleOk}
                >
                    Connect
                </CmdButton>
            </DialogActions>
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
