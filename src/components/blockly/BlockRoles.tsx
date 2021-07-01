import React, { useContext } from "react"
import useChange from "../../jacdac/useChange"
import BlockContext from "./BlockContext"
import { Grid } from "@material-ui/core"
import RoleChip from "./RoleChip"

export default function BlockClientRoles() {
    const { roleManager } = useContext(BlockContext)
    const roles = useChange(roleManager, _ => _?.roles)

    return (
        <>
            {roles?.map(({ role, service, serviceShortId }) => (
                <Grid item key={role}>
                    <RoleChip
                        role={role}
                        service={service}
                        serviceShortId={serviceShortId}
                        server={undefined}
                    />
                </Grid>
            ))}
        </>
    )
}
