import React from "react"
import useDeviceCatalog from "../components/devices/useDeviceCatalog"
import DeviceSpecification from "../components/specification/DeviceSpecification"
import useChange from "../jacdac/useChange"

export default function Page(props: { pageContext: { node: { id: string } } }) {
    const deviceCatalog = useDeviceCatalog()
    const id = props.pageContext.node.id
    const specification = useChange(
        deviceCatalog,
        _ => _.specificationFromIdentifier(id),
        [id]
    )
    return <DeviceSpecification device={specification} />
}
