import React from "react"
import useChange from "../../jacdac/useChange"
import { TestNode } from "../../../jacdac-ts/src/testdom/nodes"
import { TestUploadState } from "../../../jacdac-ts/src/testdom/spec"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import CloudDoneIcon from "@mui/icons-material/CloudDone"
import CloudOffIcon from "@mui/icons-material/CloudOff"

export default function TestUploadStateIcon(props: { node: TestNode }) {
    const { node } = props
    const state = useChange(node, _ => _?.uploadState)
    switch (state) {
        case TestUploadState.Uploading:
            return <CloudUploadIcon aria-label="uploading" color="disabled" />
        case TestUploadState.Uploaded:
            return <CloudDoneIcon aria-label="uploaded" color="success" />
        case TestUploadState.UploadError:
            return <CloudOffIcon aria-label="upload error" color="error" />
        default:
            return null
    }
}
