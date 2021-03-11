import { Typography } from "@material-ui/core"
import React from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useServiceRole from "./useServiceRole"

export default function ServiceRole(props: { service: JDService }) {
    const { service } = props
    const role = useServiceRole(service)
    const name = role?.name

    return name ? <Typography variant="caption" component="div">{name}</Typography> : null
}
