import React, { useContext } from "react"
import { Chip } from "@mui/material"
import KindIcon, { kindName } from "./KindIcon"
import PacketsContext from "./PacketsContext"
import AppContext, { DrawerType } from "./AppContext"
import Tooltip from "./ui/Tooltip"

export default function KindChip(props: { kind: string; className?: string }) {
    const { kind, className } = props
    const { filter, setFilter } = useContext(PacketsContext)
    const { setDrawerType } = useContext(AppContext)
    const icon = KindIcon({ kind })
    const chipFilter = `kind:${kind}`
    const filtered = filter && filter.indexOf(chipFilter) > -1
    const handleClick = () => {
        if (filtered) setFilter(filter?.replace(chipFilter, "")?.trim())
        else setFilter(filter?.trim() + " " + chipFilter)
        setDrawerType(DrawerType.Packets)
    }
    return (
        <Tooltip
            title={
                filtered
                    ? `remove filter ${chipFilter}`
                    : `add filter ${chipFilter}`
            }
        >
            <span>
                <Chip
                    onClick={handleClick}
                    className={className}
                    size="small"
                    label={kindName(kind)}
                    icon={icon}
                />
            </span>
        </Tooltip>
    )
}
