import React, {
    ChangeEvent,
    useContext,
    useEffect,
    useId,
    useState,
} from "react"
import CmdButton from "../CmdButton"
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    TextField,
} from "@mui/material"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"
import useDevices from "../hooks/useDevices"
import BrainManagerContext from "./BrainManagerContext"
import SelectDevice from "../select/SelectDevice"
import useBus from "../../jacdac/useBus"
import { SRV_AZURE_IOT_HUB_HEALTH } from "../../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"

export default function RegisterBrainDeviceDialog(props: {
    open: boolean
    setOpen: (v: boolean) => void
}) {
    const { open, setOpen } = props
    const { brainManager } = useContext(BrainManagerContext)
    // devices with azure iot health + jacsript manager
    const devices = useDevices({
        announced: true,
        serviceClass: SRV_AZURE_IOT_HUB_HEALTH,
    })
    const [deviceId, setDeviceId] = useState(devices[0]?.id || "")
    const bus = useBus()
    const device = bus.node(deviceId) as JDDevice
    const [name, setName] = useState("")
    const nameId = useId()
    const disabled = !device || !name

    useEffect(() => {
        if (device && !name) setName(device.friendlyName)
    }, [device])

    const reset = () => {
        setDeviceId("")
        setName("")
        setOpen(false)
    }

    const handleCancel = reset
    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
    }
    const handleOk = async () => {
        await brainManager?.registerDevice(device, name)
        reset()
    }
    return (
        <Dialog open={open} fullWidth={true} maxWidth={"lg"}>
            <DialogTitleWithClose onClose={handleCancel}>
                Register your IoT brain
            </DialogTitleWithClose>
            <DialogContent>
                <DialogContentText>
                    Register your IoT brains to use with the cloud brain
                    manager.
                </DialogContentText>
                <Grid container spacing={1}>
                    <Grid item>
                        <SelectDevice
                            devices={devices}
                            deviceId={deviceId}
                            onChange={setDeviceId}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            id={nameId}
                            value={name}
                            label="Name"
                            fullWidth={true}
                            type="text"
                            placeholder="Device friendly name"
                            onChange={handleNameChange}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <CmdButton
                    variant="contained"
                    color="primary"
                    disabled={disabled}
                    onClick={handleOk}
                >
                    Register
                </CmdButton>
            </DialogActions>
        </Dialog>
    )
}
