import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import React from "react"
import StyledTreeItem from "../ui/StyledTreeItem"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import { identifierToUrlPath } from "../../../jacdac-ts/src/jdom/spec"

export default function DeviceProductInformationTreeItem(props: { device: JDDevice }) {
    const { device } = props
    const { id } = device
    const specification = useDeviceSpecification(device)
    if (!specification) return null

    const to = `/devices/${identifierToUrlPath(specification.id)}`
    return (
        <StyledTreeItem
            nodeId={`${id}:catalog`}
            labelTo={to}
            labelText={specification.name}
            labelInfo={specification.company}
        />
    )
}