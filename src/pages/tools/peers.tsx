import {
    NoSsr,
} from "@material-ui/core"
import React, { lazy } from "react"
import Suspense from "../../components/ui/Suspense"
// tslint:disable-next-line: no-submodule-imports match-default-export-name

const PeerConfiguration = lazy(
    () => import("../../components/peer/PeerConfiguration")
)

export default function PeerView() {
    // client only page
    return (
        <NoSsr>
            <Suspense>
                <PeerConfiguration />
            </Suspense>
        </NoSsr>
    )
}
