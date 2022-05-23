import React, { Component, ErrorInfo, ReactNode } from "react"
/*
import {
    ApplicationInsights,
    SeverityLevel,
} from "@microsoft/applicationinsights-web"
*/
export type EventProperties = Record<string, string | number | boolean>
const sha = process.env.GATSBY_GITHUB_SHA

function splitProperties(props: EventProperties) {
    if (!props) return {}
    const keys = Object.keys(props)
    if (!keys.length) return {}

    const measurements: Record<string, number> = {}
    const properties: Record<string, string | number> = {}
    for (const key of keys) {
        const value = props[key]
        if (typeof value === "number") measurements[key] = value
        else if (typeof value === "boolean") properties[key] = value ? 1 : 0
        else if (typeof value !== "undefined") properties[key] = value
    }
    return { measurements, properties }
}

const INSTRUMENTATION_KEY = ""
const appInsights: any =
    typeof window !== "undefined" &&
    INSTRUMENTATION_KEY &&
    // ignore dev environment
    !/http:\/\/localhost/.test(window.location.href) &&
    undefined
/*    
    new ApplicationInsights({
        config: {
            instrumentationKey: INSTRUMENTATION_KEY,
            isStorageUseDisabled: true,
            isCookieUseDisabled: true,
            disableCookiesUsage: true,
            disableAjaxTracking: true,
            enableSessionStorageBuffer: false,
            autoTrackPageVisitTime: true,
        },
    })
*/
if (appInsights) {
    appInsights.loadAppInsights()
    appInsights.addTelemetryInitializer(envelope => {
        if (envelope.data) envelope.data.sha = sha
    })
    appInsights.trackPageView({ name: window.location.href })
}

const page: () => void = appInsights
    ? () => appInsights.trackPageView({ name: window.location.href })
    : () => {}

const trackEvent: (name: string, properties?: EventProperties) => void =
    appInsights
        ? (name, properties) =>
              appInsights.trackEvent({
                  name,
                  ...splitProperties(properties),
              })
        : () => {}

const trackError: (exception: Error, properties?: EventProperties) => void =
    appInsights
        ? (exception, properties) =>
              appInsights.trackException({
                  exception,
                  ...splitProperties(properties),
              })
        : () => {}

const severities = {
    /*
    debug: SeverityLevel.Verbose,
    warn: SeverityLevel.Warning,
    error: SeverityLevel.Error,
    info: SeverityLevel.Information,
    log: SeverityLevel.Information,
*/
}
const trackTrace: (
    message: string,
    level?: "debug" | "log" | "info" | "warn" | "error",
    properties?: EventProperties
) => void = appInsights
    ? (message, level, properties) =>
          appInsights.trackTrace(
              {
                  message,
                  severityLevel: severities[level] || undefined,
              },
              splitProperties(properties).properties
          )
    : () => {}

export const analytics = {
    page,
    trackEvent,
    trackError,
    trackTrace,
    sha,
}

// store instance
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window["analytics"] = analytics
}

export default function useAnalytics() {
    return analytics
}

export interface Props {
    children: ReactNode
}

export interface State {
    hasError: boolean
}

export class AppInsightsErrorBoundary extends Component<Props, State> {
    private chunkLoadErrorCount = 0
    public state: State = {
        hasError: false,
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        trackError?.(error, errorInfo as unknown as EventProperties)
        console.error("render error caught", { error, errorInfo })
        if (/ChunkLoadError/i.test(error.message)) {
            this.chunkLoadErrorCount++
            // if online, and too many chunk errors reload
            if (
                this.chunkLoadErrorCount === 100 &&
                typeof window !== "undefined" &&
                !!navigator.onLine
            ) {
                trackEvent("error.chunkload.reload")
                window.location.reload()
            }
        }
    }

    public render() {
        if (this.state.hasError) {
            return <h1>Something went wrong. Please reload the page.</h1>
        }
        return this.props.children
    }
}
