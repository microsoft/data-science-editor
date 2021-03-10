import React from "react"
import ServiceMarkdown from "../components/ServiceMarkdown"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Page(props: { pageContext: any }) {
    return <ServiceMarkdown {...props.pageContext} />
}
