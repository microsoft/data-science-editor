import React, { useMemo } from "react"
import { WindowLocation } from "@reach/router"
import { Breadcrumbs as MaterialBreadcrumbs } from "@mui/material"
import { Link } from "gatsby-theme-material-ui"

export default function Breadcrumbs(props: { location: WindowLocation }) {
    const { location } = props
    const { pathname } = location

    const parts = useMemo(
        () => pathname.split(/\//g).filter(p => !!p && p !== "jacdac-docs"),
        [pathname]
    )

    if (!parts.length) return null
    return (
        <>
            <MaterialBreadcrumbs aria-label="breadcrumb">
                <Link to="/" underline="hover">
                    Home
                </Link>
                {parts.map((part, i) => (
                    <Link
                        key={i}
                        color={
                            i === parts.length - 1 ? "textPrimary" : undefined
                        }
                        aria-current={
                            i === parts.length - 1 ? "page" : undefined
                        }
                        to={"/" + parts.slice(0, i + 1).join("/")}
                        underline="hover"
                    >
                        {part}
                    </Link>
                ))}
            </MaterialBreadcrumbs>
        </>
    )
}
