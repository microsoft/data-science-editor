/* eslint-disable jsx-a11y/media-has-caption */
import {
    CardContent,
    FormControlLabel,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    Checkbox,
    Grid,
} from "@mui/material"
import React, {
    CSSProperties,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import useLocalStorage from "../hooks/useLocalStorage"
import useEffectAsync from "../useEffectAsync"
import IconButtonWithTooltip from "./IconButtonWithTooltip"
import useMounted from "../hooks/useMounted"
import AppContext from "../AppContext"
import { Alert } from "@mui/material"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import DraggableCard from "./DraggableCard"
import VideoSettingsIcon from "@mui/icons-material/VideoSettings"
import {
    MediaRecorderButton,
    supportsMediaRecorder,
} from "./MediaRecorderButton"

export default function WebCam() {
    const { setShowWebCam } = useContext(AppContext)
    const [devices, setDevices] = useState<MediaDeviceInfo[]>()
    const [deviceId, setDeviceId] = useLocalStorage("webcam_deviceid", "")
    const [working, setWorking] = useState(false)
    const [flip, setFlip] = useLocalStorage("webcam_flip", false)
    const streamRef = useRef<MediaStream>()
    const videoRef = useRef<HTMLVideoElement>()
    const [settingsOpen, setSettingsOpen] = useState(false)
    const mounted = useMounted()

    const supportsFullScreen =
        typeof document !== "undefined" && !!document.fullscreenEnabled

    const handleClose = async () => await setShowWebCam(false)
    const handleSettings = () => {
        console.debug(`toggle settings`, { settingsOpen })
        setSettingsOpen(!settingsOpen)
    }
    const handleFlipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFlip(event.target.checked)
    }
    const handleDeviceChange = (
        ev: SelectChangeEvent<string>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => setDeviceId(ev.target.value)
    const handleFullScreen = () => videoRef.current?.requestFullscreen()
    const stop = () => {
        const stream = streamRef.current
        if (stream) {
            console.debug(`webcam: stop`)
            try {
                const tracks = stream.getTracks()
                if (tracks) tracks.forEach(track => track.stop())
            } catch (e) {
                console.debug(e)
            }
            streamRef.current = undefined
        }
        const video = videoRef.current
        if (video) {
            try {
                video.srcObject = undefined
            } catch (e) {
                console.debug(e)
            }
        }
    }

    // start camera
    useEffectAsync(async () => {
        stop()

        console.debug(`webcam: start '${deviceId || "?"}'`)
        try {
            setWorking(true)
            stop()
            const filter: any | MediaStreamConstraints = {
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    focusMode: "manual",
                    exposureMode: "manual",
                    whiteBalanceMode: "manual",
                },
                audio: false,
            }
            if (deviceId)
                (filter.video as MediaTrackConstraints).advanced = [
                    { deviceId: deviceId },
                ]

            const stream = await navigator.mediaDevices.getUserMedia(filter)
            // const track = stream.getVideoTracks()[0]
            // console.log({
            //     capabilities: track.getCapabilities(),
            //     constraints: track.getConstraints(),
            //     settings: track.getSettings(),
            // })
            streamRef.current = stream
            const video = videoRef.current
            video.srcObject = stream
            await video.play()

            console.debug(`webcam: play started`)
        } catch (e) {
            console.debug(`webcam: play failed`)
            console.error(e)
            setSettingsOpen(true)
        } finally {
            setWorking(false)
        }
    }, [deviceId])

    const updateDevices = async () => {
        console.debug(`webcam: update devices`)
        try {
            // enumerate devices
            const devices = await navigator.mediaDevices.enumerateDevices()
            const webcams = devices.filter(
                device => device.kind == "videoinput"
            )
            if (mounted()) setDevices(webcams)
        } catch (e) {
            console.debug(e)
            if (mounted()) setDevices([])
        }
    }

    useEffectAsync(async () => {
        if (settingsOpen) await updateDevices()
    }, [settingsOpen])

    useEffect(() => {
        navigator.mediaDevices.addEventListener("devicechange", updateDevices)
        return () =>
            navigator.mediaDevices.removeEventListener(
                "devicechange",
                updateDevices
            )
    })

    // cleanup
    useEffect(() => stop, [])

    const style: CSSProperties = {
        transform: flip ? "rotate(180deg)" : undefined,
    }

    return (
        <DraggableCard
            onClose={handleClose}
            title={
                settingsOpen && (
                    <Grid container spacing={1}>
                        {devices && (
                            <Grid item>
                                <FormControl variant="outlined" size="small">
                                    <Select
                                        title="select a webcam"
                                        onChange={handleDeviceChange}
                                        value={deviceId || ""}
                                        disabled={working}
                                    >
                                        {devices?.map(({ deviceId, label }) => (
                                            <MenuItem
                                                key={deviceId}
                                                value={deviceId}
                                            >
                                                {label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        <Grid item>
                            <FormControlLabel
                                label="rotate 180"
                                control={
                                    <Checkbox
                                        checked={flip}
                                        size="small"
                                        onChange={handleFlipChange}
                                    />
                                }
                            />
                        </Grid>
                    </Grid>
                )
            }
            actionItems={
                <>
                    {supportsMediaRecorder() && (
                        <Grid item>
                            <MediaRecorderButton stream={streamRef.current} />
                        </Grid>
                    )}
                    {supportsFullScreen && (
                        <Grid item>
                            <IconButtonWithTooltip
                                size="large"
                                onClick={handleFullScreen}
                                title="full screen"
                                disabled={working}
                            >
                                <FullscreenIcon />
                            </IconButtonWithTooltip>
                        </Grid>
                    )}
                    <Grid item>
                        <IconButtonWithTooltip
                            size="large"
                            onClick={handleSettings}
                            title="Settings"
                        >
                            <VideoSettingsIcon />
                        </IconButtonWithTooltip>
                    </Grid>
                </>
            }
            alert={
                working && (
                    <CardContent>
                        <Alert severity="info">starting camera...</Alert>
                    </CardContent>
                )
            }
        >
            <video
                autoPlay
                playsInline
                ref={videoRef}
                muted={true}
                title="webcam"
                style={style}
            />
        </DraggableCard>
    )
}
