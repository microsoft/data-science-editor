import { NoSsr } from "@mui/material"
import React, { lazy } from "react"
import Suspense from "../../components/ui/Suspense"
const Console = lazy(() => import("../../components/console/Console"))

export default function Page() {
    return (
        <NoSsr>
            <Suspense>
                <Console hidePopout={true} />
            </Suspense>
        </NoSsr>
    )
}
