import React from "react"
import Alert from "../ui/Alert"
import { AlertTitle } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import useBus from "../../jacdac/useBus"
import { BusInteractionMode } from "../../../jacdac-ts/src/jacdac"
import useInteractionMode from "./useInteractionMode"

export default function PassiveAlert() {
    const bus = useBus()
    const { interactionMode, interactionTitle, interactionDescription } =
        useInteractionMode()
    const handleActive = () => (bus.interactionMode = BusInteractionMode.Active)
    const handlePassive = () =>
        (bus.interactionMode = BusInteractionMode.Passive)
    if (interactionMode === BusInteractionMode.Active) return null

    return (
        <Alert severity="warning" closeable={true}>
            <AlertTitle>{interactionTitle}</AlertTitle>
            {interactionDescription}
            {interactionMode !== BusInteractionMode.Passive && (
                <Button
                    sx={{ ml: 1 }}
                    color="inherit"
                    variant="outlined"
                    onClick={handlePassive}
                >
                    Switch to Passive Mode
                </Button>
            )}
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
