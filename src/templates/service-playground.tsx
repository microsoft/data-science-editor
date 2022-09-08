import React from "react"
import { serviceSpecificationFromClassIdentifier } from "../../jacdac-ts/src/jdom/spec"
import ServiceSpecification from "../components/specification/ServiceSpecification"

import CoreHead from "../components/shell/Head"
export const Head = (props) => <CoreHead {...props} />

export default function Page(props: {
    pageContext: { node: { classIdentifier: number } }
}) {
    const spec = serviceSpecificationFromClassIdentifier(
        props.pageContext.node.classIdentifier
    )
    return <ServiceSpecification service={spec} />
}
