import { Grid } from "@mui/material"
import React, { lazy, ReactNode } from "react"
import {
    RoleBinding,
    RoleManager,
} from "../../../jacdac-ts/src/jdom/rolemanager"
import RoleChipItems from "./RoleChipItems"
import Suspense from "../ui/Suspense"
const StartSimulatorButton = lazy(
    () => import("../buttons/StartSimulatorButton")
)

export default function RolesToolbar(props: {
    roleManager: RoleManager
    startSimulator?: boolean
    onRoleClick: (role: RoleBinding) => void
    children?: ReactNode
}) {
    const { children, roleManager, startSimulator, onRoleClick } = props
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
            <RoleChipItems
                roleManager={roleManager}
                onRoleClick={onRoleClick}
            />
        </Grid>
    )
}
