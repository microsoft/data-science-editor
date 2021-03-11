import React from "react"
import { Link } from 'gatsby-theme-material-ui';
import { serviceSpecificationFromClassIdentifier } from "../../jacdac-ts/src/jdom/spec"
import ServiceTest from "../components/test/ServiceTest"

export default function Page(props: { pageContext: { node: { classIdentifier: number } } }) {
    const spec = serviceSpecificationFromClassIdentifier(props.pageContext.node.classIdentifier);
    return <>
        <ServiceTest serviceSpec={spec} />
        <h2>See Also</h2>
        < ul >
            <li><a href={`https://github.com/microsoft/jacdac/tree/main/services/${props.pageContext.node.shortId}.md`}>Edit specification source</a>.</li>
            <li>Read <Link to="/reference/service-specification/">Service Specification Language</Link> reference</li>
            <li>Create a new service specification using the <Link to="/tools/service-editor/">Service Editor</Link></li>
            <li>Using services in JavaScript with the <Link to={`/clients/web/jdom`}>Jacdac Object Model (JDOM)</Link></li>
        </ul>
    </>
}

