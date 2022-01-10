import React, { useState } from "react"
import SettingsIcon from "@mui/icons-material/Settings"
import IconButtonWithTooltip from "./IconButtonWithTooltip"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material"
import useAudioContext from "../hooks/useAudioContext"
import useEffectAsync from "../useEffectAsync"

export default function MicrophoneSettingsButton() {
    const [showDialog, setShowDialog] = useState(false)
    const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>()
    const { microphoneId, setMicrophoneId, onClickActivateAudioContext } =
        useAudioContext()

    const handleOpen = () => {
        onClickActivateAudioContext()
        setShowDialog(true)
    }
    const handleCloseConfirm = () => setShowDialog(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMicrophoneChange = (ev: SelectChangeEvent<any>) => {
        const id = ev.target.value
        setMicrophoneId(id)
    }

    useEffectAsync(async () => {
        if (showDialog) {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const microphones = devices.filter(
                device => device.kind == "audioinput"
            )
            setMicrophones(microphones)
            if (
                microphones?.length &&
                (!microphoneId ||
                    !microphones.find(mic => mic.deviceId === microphoneId))
            )
                setMicrophoneId(microphones[0].deviceId)
        }
    }, [showDialog])

    return (
        <>
            <IconButtonWithTooltip
                title="Configure microphone"
                onClick={handleOpen}
            >
                <SettingsIcon />
            </IconButtonWithTooltip>
            {showDialog && (
                <Dialog open={showDialog} onClose={handleCloseConfirm}>
                    <DialogContent>
                        <DialogContentText>Choose microphone</DialogContentText>
                        {microphones && (
                            <Select
                                value={microphoneId || ""}
                                onChange={handleMicrophoneChange}
                            >
                                {microphones?.map(mic => (
                                    <MenuItem
                                        key={mic.deviceId}
                                        value={mic.deviceId}
                                    >
                                        {mic.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirm}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    )
}
