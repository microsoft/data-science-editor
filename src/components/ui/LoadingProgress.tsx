import { CircularProgress } from "@mui/material"
import React from "react"

export default function LoadingProgress(props: { size?: string }) {
    const { size } = props
    return (
        <CircularProgress
            disableShrink
            variant="indeterminate"
            size={size || "1em"}
            aria-label="loading"
        />
    )
}
