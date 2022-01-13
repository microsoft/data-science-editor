import { AlertTitle } from "@mui/material"
import React from "react"
import { UIFlags } from "../../jacdac/providerbus"
import Alert from "../ui/Alert"

export default function DevToolsAlert() {
    const devtools = UIFlags.devTools
    if (!devtools) return null

    return (
        <Alert severity="info" closeable={true}>
            <AlertTitle>Developer Tools Mode</AlertTitle>
            Connected to developer tool proxy.
        </Alert>
    )
}
