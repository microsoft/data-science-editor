import React from "react"

export default function Page(props: { location: { pathname: string } }) {
    const { location } = props
    const { pathname } = location

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
