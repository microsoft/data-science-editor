import React, { lazy, useContext, useEffect } from "react"
import Dashboard from "../components/dashboard/Dashboard"
import { useLocationSearchParamBoolean } from "../components/hooks/useLocationSearchParam"
import Suspense from "../components/ui/Suspense"
import { UIFlags } from "../jacdac/providerbus"

export const frontmatter = {
    title: "Dashboard",
}
import CoreHead from "../components/shell/Head"
import AppContext, { DrawerType } from "../components/AppContext"
export const Head = props => <CoreHead {...props} {...frontmatter} />

const DataStreamer = lazy(() => import("../components/tools/DataStreamer"))

export default function Page() {
    const dataStreamer =
        useLocationSearchParamBoolean("datastreamer", false) && UIFlags.hosted
    const { drawerType, setDrawerType } = useContext(AppContext)
    useEffect(() => {
        if (drawerType === DrawerType.Dashboard) setDrawerType(DrawerType.None)
    }, [])

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
                showDeviceScript={true}
                showConnect={UIFlags.connect}
                showStartSimulators={true}
                showStartRoleSimulators={true}
                showDeviceProxyAlert={true}
            />
        </>
    )
}
