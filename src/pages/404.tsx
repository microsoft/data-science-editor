import React from "react"

export default function Page(props: { location: { pathname: string } }) {
    const { location } = props
    const { pathname } = location

    // dynamic routes
    if (/\/dtmi\/devices\//.test(pathname)) {
        return (
            <>
                <h1>DTDL Device</h1>
                <p>dtmi: {pathname}</p>
            </>
        )
    }

    return (
        <>
            <h1>404 Not Found</h1>
            <p>
                You just hit <code>{pathname}</code> that doesn&#39;t exist...
                the sadness.
            </p>
        </>
    )
}
