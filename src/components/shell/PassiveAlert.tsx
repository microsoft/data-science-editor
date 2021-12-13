import React, { useContext } from "react"
import Alert from "../ui/Alert"
import { AlertTitle } from "@mui/material"
import AppContext from "../AppContext"
import { Button } from "gatsby-theme-material-ui"

export default function PassiveAlert() {
    const { passive, setPassive } = useContext(AppContext)
    const handleActive = () => setPassive(false)
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
