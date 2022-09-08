import React, { lazy } from "react"
import Dashboard from "../components/dashboard/Dashboard"
import { useLocationSearchParamBoolean } from "../components/hooks/useLocationSearchParam"
import Suspense from "../components/ui/Suspense"
import { UIFlags } from "../jacdac/providerbus"

export const frontmatter = {
    title: "Dashboard",
}
import CoreHead from "../components/shell/Head"
export const Head = props => <CoreHead {...props} {...frontmatter} />

const DataStreamer = lazy(() => import("../components/tools/DataStreamer"))
const JacscriptVMLoader = lazy(
    () => import("../components/jacscript/JacscriptVMLoader")
)

export default function Page() {
    const dataStreamer =
        useLocationSearchParamBoolean("datastreamer", false) && UIFlags.hosted
    const jacscript = useLocationSearchParamBoolean("jacscript", false)

    return (
        <>
            {dataStreamer && (
                <Suspense>
                    <DataStreamer />
                </Suspense>
            )}
            {jacscript && (
                <Suspense>
                    <JacscriptVMLoader />
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
