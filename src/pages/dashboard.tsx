import React, { lazy, Suspense } from "react"
import Dashboard from "../components/dashboard/Dashboard"
import { useLocationSearchParamBoolean } from "../components/hooks/useLocationSearchParam"
import DelayedOnDevices from "../components/ui/DelayedOnDevices"
import { UIFlags } from "../jacdac/providerbus"
const FirmwareLoader = lazy(
    () => import("../components/firmware/FirmwareLoader")
)
const DataStreamer = lazy(() => import("../components/tools/DataStreamer"))

export default function Page() {
    const dataStreamer =
        useLocationSearchParamBoolean("datastreamer", false) && UIFlags.hosted

    return (
        <>
            <DelayedOnDevices timeout={120000}>
                <Suspense fallback={null}>
                    <FirmwareLoader />
                </Suspense>
            </DelayedOnDevices>
            {dataStreamer && (
                <Suspense fallback={null}>
                    <DataStreamer />
                </Suspense>
            )}
            <Dashboard
                showAvatar={true}
                showHeader={true}
                showConnect={true}
                showStartSimulators={true}
                showStartRoleSimulators={true}
            />
        </>
    )
}
