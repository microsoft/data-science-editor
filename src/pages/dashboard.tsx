import React, { lazy, Suspense } from "react"
import Dashboard from "../components/dashboard/Dashboard"
import DelayedOnDevices from "../components/ui/DelayedOnDevices"
const FirmwareLoader = lazy(
    () => import("../components/firmware/FirmwareLoader")
)

export default function Page() {
    return (
        <>
            <DelayedOnDevices timeout={120000}>
                <Suspense fallback={null}>
                    <FirmwareLoader />
                </Suspense>
            </DelayedOnDevices>
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
