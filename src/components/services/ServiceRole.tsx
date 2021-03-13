import { Button } from "@material-ui/core"
import React, { useContext } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import AppContext from "../AppContext"
import useRoleManager from "./useRoleManager"
import useServiceRole from "./useServiceRole"

export default function ServiceRole(props: { service: JDService }) {
    const { service } = props
    const { showSelectRoleDialog } = useContext(AppContext)
    const roleManager = useRoleManager()
    const role = useServiceRole(service)
    const handleClick = () => showSelectRoleDialog(service)

    // hide if no role manager or role not compatible with required roles
    if (!roleManager?.hasRoleForService(service))
        return null;

    return <Button size="small" onClick={handleClick}>{role || "..."}</Button>
}
