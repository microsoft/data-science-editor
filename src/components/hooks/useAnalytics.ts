import { ApplicationInsights } from "@microsoft/applicationinsights-web-basic"

// YOUR_INSTRUMENTATION_KEY_GOES_HERE
const instrumentationKey: string = undefined;
const appInsights =
    instrumentationKey &&
    new ApplicationInsights({
        instrumentationKey,
        isStorageUseDisabled: true,
        isCookieUseDisabled: true,
    })
const page =
    typeof window !== "undefined"
        ? () =>
              appInsights?.track({
                  name: window.location.href,
                  time: new Date().toUTCString(),
                  baseType: "PageData",
              })
        : () => {}
const track =
    typeof window !== "undefined"
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (name: string, properties?: { [key: string]: any }) =>
              appInsights?.track({
                  name,
                  time: new Date().toUTCString(),
                  data: properties,
                  baseType: "EventData",
              })
        : // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (name, properties) => {}
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).analytics = {
        page,
        track,
    }
}

export default function useAnalytics() {
    return {
        page,
        track,
    }
}
