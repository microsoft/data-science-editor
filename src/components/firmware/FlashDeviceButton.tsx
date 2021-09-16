import { Button } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React, { useContext, useState } from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import {
    flashFirmwareBlob,
    updateApplicable,
    FirmwareBlob,
} from "../../../jacdac-ts/src/jdom/flashing"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import CircularProgressWithLabel from "../ui/CircularProgressWithLabel"
import AppContext from "../AppContext"
import useChange from "../../jacdac/useChange"
import useMounted from "./../hooks/useMounted"
import useAnalytics from "../hooks/useAnalytics"

export function FlashDeviceButton(props: {
    device: JDDevice
    blob: FirmwareBlob
    ignoreFirmwareCheck?: boolean
}) {
    const { device, blob, ignoreFirmwareCheck } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setError } = useContext(AppContext)
    const { trackEvent } = useAnalytics()
    const [progress, setProgress] = useState(0)
    const firmwareInfo = useChange(device, d => d?.firmwareInfo)
    const update =
        ignoreFirmwareCheck ||
        (blob?.version &&
            firmwareInfo?.version &&
            updateApplicable(firmwareInfo, blob))
    const upToDate =
        blob?.version &&
        firmwareInfo?.version &&
        blob.version === firmwareInfo.version
    const flashing = useChange(device, d => !!d?.flashing)
    const missing = !device || !blob
    const disabled = flashing
    const mounted = useMounted()

    const handleFlashing = async () => {
        if (device.flashing) return
        trackEvent("flash.start", {
            firmware: firmwareInfo.productIdentifier,
            version: firmwareInfo.version,
        })
        try {
            setProgress(0)
            device.flashing = true // don't refresh registers while flashing
            const updateCandidates = [firmwareInfo]
            await flashFirmwareBlob(
                bus,
                blob,
                updateCandidates,
                ignoreFirmwareCheck,
                prog => {
                    if (mounted()) setProgress(prog)
                }
            )
            // trigger info
            device.firmwareInfo = undefined
        } catch (e) {
            trackEvent("flash.error", {
                firmware: firmwareInfo.productIdentifier,
                version: firmwareInfo.version,
            })
            if (mounted()) setError(e)
        } finally {
            device.flashing = false
            trackEvent("flash.success", {
                firmware: firmwareInfo.productIdentifier,
                version: firmwareInfo.version,
            })
        }
    }

    // tslint:disable-next-line: react-this-binding-issue
    return missing ? (
        <Alert severity="info">No firmware available</Alert>
    ) : flashing ? (
        <CircularProgressWithLabel value={progress} />
    ) : firmwareInfo || update ? (
        <>
            {upToDate ? (
                <Alert severity="success">Up to date!</Alert>
            ) : (
                <Alert severity="warning">{blob.version} available</Alert>
            )}
            <Button
                title={`Flash ${blob.version}`}
                disabled={disabled}
                variant="contained"
                color={"primary"}
                onClick={handleFlashing}
            >
                Flash
            </Button>
        </>
    ) : (
        <Alert severity="info">No firmware available</Alert>
    )
}
