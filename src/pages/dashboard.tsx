import React, { lazy, Suspense } from "react"
import Dashboard from "../components/dashboard/Dashboard"
import { useLocationSearchParamBoolean } from "../components/hooks/useLocationSearchParam"
import { UIFlags } from "../jacdac/providerbus"
const DataStreamer = lazy(() => import("../components/tools/DataStreamer"))

export default function Page() {
    const dataStreamer =
        useLocationSearchParamBoolean("datastreamer", false) && UIFlags.hosted

    return (
        <>
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
                showDeviceProxyAlert={true}
            />
        </>
    )
}
