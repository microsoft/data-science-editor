import React from "react"
import { Chip } from "@mui/material"

export default function FilterChip(props: {
    label: string
    value: boolean
    icon?: JSX.Element
    onClick: () => void
}) {
    const { label, value, icon, onClick } = props
    const descr = value
        ? `Disable ${label} filter`
        : `Filter by ${label} support`
    return (
        <Chip
            label={label}
            aria-label={descr}
            title={descr}
            icon={icon}
            variant={value ? undefined : "outlined"}
            color={value ? "secondary" : undefined}
            onClick={onClick}
        />
    )
}