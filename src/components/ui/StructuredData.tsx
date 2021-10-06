import React, { useMemo } from "react"
import { Helmet } from "react-helmet"

export type StructuredData = unknown

export default function StructuredData(props: { payload: StructuredData }) {
    const { payload } = props
    const rendered = useMemo(() => JSON.stringify(payload), [payload])
    return (
        <Helmet>
            <script type="application/ld+json">{rendered}</script>
        </Helmet>
    )
}
