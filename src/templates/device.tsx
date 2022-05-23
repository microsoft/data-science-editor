import React from "react"
import DeviceSpecification from "../components/specification/DeviceSpecification"
import { useDeviceSpecificationFromIdentifier } from "../jacdac/useDeviceSpecification"

export default function Page(props: { pageContext: { node: { id: string } } }) {
    const id = props.pageContext.node.id
    const specification = useDeviceSpecificationFromIdentifier(id)
    return <DeviceSpecification device={specification} />
}
