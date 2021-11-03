import React, { useContext } from "react"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import FingerprintIcon from "@mui/icons-material/Fingerprint"
import { Chip, IconButton } from "@mui/material"
import PacketsContext from "./PacketsContext"
import AppContext, { DrawerType } from "./AppContext"
import Tooltip from "./ui/Tooltip"

export default function IDChip(props: {
    id: number | string
    className?: string
    filter?: string
}) {
    const { id, className, filter } = props
    const { filter: packetFilter, setFilter: setPacketFilter } =
        useContext(PacketsContext)
    const { setDrawerType } = useContext(AppContext)

    const ids =
        typeof id === "string"
            ? id
            : `0x${id !== undefined ? (id as number).toString(16) : "???"}`
    const filtered = packetFilter && packetFilter.indexOf(filter) > -1
    const handleFilterClick = () => {
        if (filtered) setPacketFilter(packetFilter?.replace(filter, "")?.trim())
        else setPacketFilter(packetFilter?.trim() + " " + filter)
        setDrawerType(DrawerType.Packets)
    }
    const icon = <FingerprintIcon />
    const title = filtered ? `remove filter ${filter}` : `add filter ${filter}`
    if (filter)
        return (
            <Tooltip
                title={
                    filtered
                        ? `remove filter ${filter}`
                        : `add filter ${filter}`
                }
            >
                <span>
                    <Chip
                        className={className}
                        size="small"
                        icon={
                            <IconButton
                                aria-label={title}
                                onClick={handleFilterClick}
                                size="large"
                            >
                                {icon}
                            </IconButton>
                        }
                        label={ids}
                    />
                </span>
            </Tooltip>
        )
    else
        return (
            <Chip
                aria-label={title}
                className={className}
                size="small"
                icon={icon}
                title={`identifier ${ids}`}
                label={ids}
            />
        )
}
