import React, { useMemo } from "react"
import { getParser, Parser } from "bowser"
import Alert from "./Alert"
import { AlertTitle } from "@mui/material"
import { useLocationSearchParamBoolean } from "../hooks/useLocationSearchParam"

export default function BrowserCompatibilityAlert(props: {
    filter: Parser.checkTree
    label: string
}) {
    const { filter, label } = props
    const browsercheck = useLocationSearchParamBoolean("browsercheck", true)
    const compatible = useMemo(() => {
        if (typeof window !== "undefined") {
            const browser = getParser(window.navigator.userAgent)
            return browser.satisfies(filter)
        }
        return true // SSR
    }, [JSON.stringify(filter)])

    if (compatible || !browsercheck) return null
    return (
        <Alert severity="warning">
            <AlertTitle>Browser not compatible.</AlertTitle>
            {label}
        </Alert>
    )
}
