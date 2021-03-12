import { Button } from "@material-ui/core"
import React from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useRoleManager from "./useRoleManager"
import useServiceRole from "./useServiceRole"

export default function ServiceRole(props: { service: JDService }) {
    const { service } = props
    const roleManager = useRoleManager()
    const role = useServiceRole(service)
    const handleClick = () => {
        
    }

    if (!roleManager)
        return null; // nothing to do

    return <Button size="small" onClick={handleClick}>{role || "..."}</Button>
}
