import React, { useMemo } from "react"
import { WindowLocation } from "@reach/router"
import { Breadcrumbs as MaterialBreadcrumbs } from "@material-ui/core"
import { Link } from "gatsby-theme-material-ui"
import { withPrefix } from "gatsby-link"
import StructuredData from "./StructuredData"

function BreadcrumbsStructuredData(props: { parts: string[] }) {
    const { parts } = props
    const payload = useMemo(
        () => ({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: parts.map((part, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: part,
                item: withPrefix("/" + parts.slice(0, i + 1).join("/")),
            })),
        }),
        [parts]
    )

    return <StructuredData payload={payload} />
}

export default function Breadcrumbs(props: { location: WindowLocation }) {
    const { location } = props
    const { pathname } = location

    const parts = useMemo(
        () => pathname.split(/\//g).filter(p => !!p && p !== "jacdac-docs"),
        [pathname]
    )

    if (!parts.length) return null
    return (
        <MaterialBreadcrumbs aria-label="breadcrumb">
            <BreadcrumbsStructuredData parts={parts} />
            <Link to="/">Home</Link>
            {parts.map((part, i) => (
                <Link
                    key={i}
                    color={i === parts.length - 1 ? "textPrimary" : undefined}
                    aria-current={i === parts.length - 1 ? "page" : undefined}
                    to={"/" + parts.slice(0, i + 1).join("/")}
                >
                    {part}
                </Link>
            ))}
        </MaterialBreadcrumbs>
    )
}
