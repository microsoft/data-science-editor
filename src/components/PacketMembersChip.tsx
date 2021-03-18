import React from "react"
// tslint:disable-next-line: no-submodule-imports
import Chip from "@material-ui/core/Chip"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import CategoryIcon from "@material-ui/icons/Category"
import Tooltip from "./ui/Tooltip"

export default function PacketMembersChip(props: {
    spec: jdspec.PacketInfo
    members: jdspec.PacketMember[]
    className?: string
}) {
    const { members, className, spec } = props
    if (!members?.length) return null

    const label = spec?.packFormat
    const title = "pack format"
    return (
        <Tooltip title={title}>
            <Chip
                style={{ textDecoration: "none" }}
                href="/reference/pack-format/"
                component="a"
                clickable
                className={className}
                size="small"
                icon={<CategoryIcon />}
                label={label}
            />
        </Tooltip>
    )
}
