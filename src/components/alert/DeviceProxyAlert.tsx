import { AlertTitle } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import React from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import Alert from "../ui/Alert"

export default function DeviceProxyAlert(props: { device: JDDevice }) {
    const { device } = props
    const proxy = useChange(device, _ => _?.proxy)
    const handleReset = () => device?.reset()
    return (
        <>
            {proxy && (
                <Alert severity="info">
                    <AlertTitle>Dongle mode</AlertTitle>
                    Device transfers Jacdac packets but does not run other code.
                    <Button
                        style={{ display: "block" }}
                        title="reset device"
                        variant="outlined"
                        onClick={handleReset}
                    >
                        Reset to Application mode
                    </Button>
                </Alert>
            )}
        </>
    )
}
