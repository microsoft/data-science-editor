import { Typography } from "@material-ui/core"
import React from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useServiceRole from "./useServiceRole"

export default function ServiceRole(props: { service: JDService }) {
    const { service } = props
    const role = useServiceRole(service)

    return role ? <Typography variant="caption" component="div">{role}</Typography> : null
}
