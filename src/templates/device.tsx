import React from "react"
import DeviceSpecification from "../components/specification/DeviceSpecification"
import { useDeviceSpecificationFromIdentifier } from "../jacdac/useDeviceSpecification"

import CoreHead from "../components/shell/Head"
export const Head = (props) => <CoreHead {...props} />

export default function Page(props: { pageContext: { node: { id: string } } }) {
    const id = props.pageContext.node.id
    const specification = useDeviceSpecificationFromIdentifier(id)
    return <DeviceSpecification device={specification} />
}
