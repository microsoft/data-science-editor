import { Component, ErrorInfo, ReactNode } from "react"
import { ApplicationInsights } from "@microsoft/applicationinsights-web-basic"

export type EventProperties = Record<string, string | number | boolean>
const repo = process.env.GATSBY_GITHUB_REPOSITORY
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

const INSTRUMENTATION_KEY = "81ad7468-8585-4970-b027-4f9e7c3eb191"
const appInsights =
    typeof window !== "undefined" &&
    INSTRUMENTATION_KEY &&
    // ignore dev environment
    !/http:\/\/localhost/.test(window.location.href) &&
    // TODO enable for all
    /dbg=1/.test(window.location.href) &&
    new ApplicationInsights({
        instrumentationKey: INSTRUMENTATION_KEY,
        isStorageUseDisabled: true,
        isCookieUseDisabled: true,
        disableCookiesUsage: true,
        disableAjaxTracking: true,
        enableSessionStorageBuffer: false,
    })
const page: () => void = appInsights
    ? () =>
          appInsights.track({
              name: "",
              time: new Date().toUTCString(),
              tags: [],
              data: { repo, sha },
              baseType: "PageviewData",
              baseData: {
                  name: window.location.href,
                  uri: window.location.href,
              },
          })
    : () => {}

const trackEvent: (name: string, properties?: EventProperties) => void =
    appInsights
        ? (name, properties) =>
              appInsights.track({
                  name: "",
                  time: new Date().toUTCString(),
                  data: { repo, sha },
                  baseType: "EventData",
                  baseData: {
                      name,
                      ...splitProperties(properties),
                  },
              })
        : () => {}

const trackError: (error: unknown, properties?: EventProperties) => void =
    appInsights
        ? (error, properties) =>
              appInsights.track({
                  name: "",
                  time: new Date().toUTCString(),
                  data: { repo, sha },
                  baseType: "ExceptionData",
                  baseData: {
                      error,
                      ...splitProperties(properties),
                  },
              })
        : () => {}

export const analytics = {
    page,
    trackEvent,
    trackError,
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
    public state: State = {
        hasError: false,
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        trackError?.(error, errorInfo as unknown as EventProperties)
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        return this.props.children
    }
}
