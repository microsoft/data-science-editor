import React, { lazy } from "react"
import Dashboard from "../components/dashboard/Dashboard"
import { useLocationSearchParamBoolean } from "../components/hooks/useLocationSearchParam"
import Suspense from "../components/ui/Suspense"
import { UIFlags } from "../jacdac/providerbus"
const DataStreamer = lazy(() => import("../components/tools/DataStreamer"))

export default function Page() {
    const dataStreamer =
        useLocationSearchParamBoolean("datastreamer", false) && UIFlags.hosted

    return (
        <>
            {dataStreamer && (
                <Suspense>
                    <DataStreamer />
                </Suspense>
            )}
            <Dashboard
                showAvatar={true}
                showHeader={true}
                showConnect={UIFlags.connect}
                showStartSimulators={true}
                showStartRoleSimulators={true}
                showDeviceProxyAlert={true}
            />
        </>
    )
}
