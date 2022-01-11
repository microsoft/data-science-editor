import React from "react"
import Alert from "../ui/Alert"
import { AlertTitle } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"

export default function PassiveAlert() {
    const bus = useBus()
    const passive = useChange(bus, _ => _.passive)
    const handleActive = () => bus.passive = false
    if (!passive) return null

    return (
        <Alert severity="warning" closeable={true}>
            <AlertTitle>Passive mode</AlertTitle>
            The web browser is not sending any packet to devices.
            <Button
                sx={{ ml: 1 }}
                color="inherit"
                variant="outlined"
                onClick={handleActive}
            >
                Switch to Active Mode
            </Button>
        </Alert>
    )
}
