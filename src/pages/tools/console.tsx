import React, { lazy } from "react"
import Suspense from "../../components/ui/Suspense"

const WebSerialConsoleButton = lazy(
    () => import("../../components/ui/WebSerialConsoleButton")
)
const ConsoleLog = lazy(() => import("../../components/ui/ConsoleLog"))

export default function Console() {
    return (
        <>
            <h1>
                Console
                <Suspense>
                    <WebSerialConsoleButton />
                </Suspense>
            </h1>
            <Suspense>
                <ConsoleLog />
            </Suspense>
        </>
    )
}
