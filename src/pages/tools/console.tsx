import React, { lazy } from "react"
import Suspense from "../../components/ui/Suspense"
const Console = lazy(() => import("../../components/console/Console"))

export default function Page() {
    return (
        <Suspense>
            <Console showToolbar={true} hidePopout={true} />
        </Suspense>
    )
}
