import React from "react"
import useChange from "../../jacdac/useChange"
import { TestNode } from "../../../jacdac-ts/src/testdom/nodes"
import { TestUploadState } from "../../../jacdac-ts/src/testdom/spec"
import { Typography } from "@mui/material"

export default function TestUploadStateMessage(props: { node: TestNode }) {
    const { node } = props
    const state = useChange(node, _ => _?.uploadState)
    const msg = {
        [TestUploadState.Uploaded]: "uploaded",
        [TestUploadState.UploadError]: "upload error",
        [TestUploadState.Uploading]: "uploading...",
    }[state]
    if (!msg) return null
    return (
        <Typography component="span" variant="subtitle2">
            {msg}
        </Typography>
    )
}
