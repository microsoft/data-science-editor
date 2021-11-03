import { Chip } from "@mui/material"
import React from "react"
import { FileSystemNode } from "./fsdom"

export default function FileSystemNodeChip(props: {
    node: FileSystemNode
    selected?: boolean
    onClick: () => void
}) {
    const { node, selected, onClick } = props
    const { name } = node
    return (
        <Chip
            clickable
            label={name.replace(/\.json$/i, "")}
            color={selected ? "primary" : undefined}
            onClick={onClick}
        />
    )
}
