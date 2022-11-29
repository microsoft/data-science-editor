import { Grid } from "@mui/material"
import React, { lazy, ReactNode } from "react"
import RoleChipItems from "./RoleChipItems"
import Suspense from "../ui/Suspense"
import { Role } from "../../../jacdac-ts/src/jdom/clients/rolemanagerclient"
const StartSimulatorButton = lazy(
    () => import("../buttons/StartSimulatorButton")
)

export default function RolesToolbar(props: {
    startSimulator?: boolean
    onRoleClick: (role: Role) => void
    children?: ReactNode
}) {
    const { children, startSimulator, onRoleClick } = props
    return (
        <Grid
            container
            direction="row"
            spacing={1}
            alignItems="center"
            alignContent="center"
        >
            {children}
            {startSimulator && (
                <Grid item>
                    <Suspense>
                        <StartSimulatorButton useChip={true} />
                    </Suspense>
                </Grid>
            )}
            <RoleChipItems onRoleClick={onRoleClick} />
        </Grid>
    )
}
