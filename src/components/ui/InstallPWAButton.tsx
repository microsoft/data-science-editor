import React, { useContext, useMemo, useState } from "react"
import useWindowEvent from "../hooks/useWindowEvent"
import { Button, ButtonProps } from "@mui/material"
import AppContext from "../AppContext"
import useAnalytics from "../hooks/useAnalytics"

function usePWAInfo() {
    const standAlone = useMemo(
        () =>
            typeof window !== "undefined" &&
            !!window.matchMedia?.("(display-mode: standalone)")?.matches,
        []
    )
    return { standAlone }
}

export default function InstallPWAButton(props: ButtonProps) {
    const { standAlone } = usePWAInfo()
    const [supportsPWA, setSupportsPWA] = useState(false)
    const [promptInstall, setPromptInstall] = useState(null)
    const { enqueueSnackbar } = useContext(AppContext)
    const { trackEvent } = useAnalytics()

    // listen for prompt
    useWindowEvent(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "beforeinstallprompt" as any,
        e => {
            trackEvent("app.beforeinstall")
            e.preventDefault()
            setSupportsPWA(true)
            setPromptInstall(e)
        },
        false,
        []
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useWindowEvent("appinstalled" as any, () => {
        trackEvent("app.installed")
        enqueueSnackbar("Jacdac app installed!", "success")
    })

    if (!supportsPWA || standAlone) return null

    const onClick = async (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.preventDefault()
        await promptInstall?.prompt()
    }
    return (
        <Button
            aria-label="Install application"
            title="Install application"
            onClick={onClick}
            variant="outlined"
            {...props}
        >
            Install
        </Button>
    )
}
