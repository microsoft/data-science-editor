import React from "react"
import { deviceSpecificationFromIdentifier } from "../../jacdac-ts/src/jdom/spec"
import DeviceSpecification from "../components/DeviceSpecification"

export default function Page(props: { pageContext: { node: { id: string } } }) {
    const id = props.pageContext.node.id;
    const specification = deviceSpecificationFromIdentifier(id)
    return <DeviceSpecification device={specification} showSource={true} />
}
