import React from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useServiceRole from "./useDeviceRole"

export default function ServiceRole(props: { service: JDService }) {
    const { service } = props
    const role = useServiceRole(service)
    const name = role?.name

    return name ? <span>{name}</span> : null
}
