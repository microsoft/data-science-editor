import React, { useContext, useEffect, useMemo, useState } from "react"
import useWindowEvent from "../hooks/useWindowEvent"
import { Button, ButtonProps } from "@mui/material"
import AppContext from "../AppContext"
import useAnalytics from "../hooks/useAnalytics"
import useEffectAsync from "../useEffectAsync"

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
    const [visible, setVisible] = useState(false)
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
            setVisible(true)
            setPromptInstall(e)
        },
        false,
        []
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useWindowEvent("appinstalled" as any, () => {
        trackEvent("app.installed")
        setVisible(false)
        enqueueSnackbar("Jacdac app installed!", "success")
    })

    // detect installed apps
    useEffectAsync(async () => {
        if (
            typeof window === "undefined" ||
            !("getInstalledRelatedApps" in navigator)
        )
            return

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apps = await (navigator as any).getInstalledRelatedApps()
            console.log("installed apps", { apps })
        } catch (e) {
            console.debug(e)
        }
    }, [])

    if (!visible || standAlone) return null

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
