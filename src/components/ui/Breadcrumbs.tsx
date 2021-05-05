import React from "react"
import { WindowLocation } from "@reach/router"
import { Breadcrumbs as MaterialBreadcrumbs } from "@material-ui/core"
import { Link } from "gatsby-theme-material-ui"

export default function Breadcrumbs(props: { location: WindowLocation }) {
    const { location } = props
    const { pathname } = location

    const parts = pathname.split(/\//g).filter(p => !!p)

    console.log({ location, pathname, parts })

    if (!parts.length) return null
    return (
        <MaterialBreadcrumbs aria-label="breadcrumb">
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
