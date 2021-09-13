import React, { useContext } from "react"
import {
    ListItem,
    ListItemIcon,
    makeStyles,
    createStyles,
    ListItemText,
    Box,
} from "@material-ui/core"
import Packet from "../../jacdac-ts/src/jdom/packet"
import PacketsContext from "./PacketsContext"
import PacketBadge from "./PacketBadge"
import AppContext, { DrawerType } from "./AppContext"
import { META_PIPE, SRV_LOGGER } from "../../jacdac-ts/src/jdom/constants"
import { prettyDuration } from "../../jacdac-ts/src/jdom/pretty"
import { ellipseJoin } from "../../jacdac-ts/src/jdom/utils"
import { jdpack, jdunpack } from "../../jacdac-ts/src/jdom/pack"
import { navigate } from "gatsby"
import useMediaQueries from "./hooks/useMediaQueries"

const useStyles = makeStyles(() =>
    createStyles({
        item: {
            marginBottom: 0,
            borderBottom: "1px solid #ddd",
        },
    })
)

export default function PacketListItem(props: {
    packet: Packet
    showTime?: boolean
    count?: number
}) {
    const { packet, count, showTime } = props
    const { selectedPacket, setSelectedPacket } = useContext(AppContext)
    const { setDrawerType } = useContext(AppContext)
    const classes = useStyles()
    const { mobile } = useMediaQueries()
    const { decoded } = packet
    const { info } = decoded || {}

    const handleClick = () => {
        if (mobile) setDrawerType(DrawerType.None)
        setSelectedPacket(packet)
        navigate("/tools/packet-inspector/")
    }
    const selected = packet === selectedPacket
    const logMessage =
        packet.serviceClass === SRV_LOGGER && packet.isReport && packet.isEvent
    const pipePackets = packet.meta[META_PIPE] as Packet[]

    const name = info?.name || packet.friendlyCommandName
    const primary =
        (packet.isCRCAck && `crc ack ${name}`) ||
        (packet.isAnnounce && `announce from ${name}`) ||
        (packet.isRegisterGet && `get ${name}`) ||
        (pipePackets &&
            `pipe port:${packet.pipePort} ${pipePackets.length} packets`) ||
        (logMessage && jdunpack<[string]>(packet.data, "s")[0]) ||
        `${packet.isRegisterSet ? "set " : ""}${name} ${
            decoded
                ? ellipseJoin(
                      decoded.decoded.map(f => f.humanValue),
                      18
                  )
                : ""
        }`
    const secondary = `${
        showTime ? `${prettyDuration(packet.timestamp)}: ` : ""
    }${packet.isCommand ? "to" : "from"} ${packet.friendlyDeviceName}/${
        packet.friendlyServiceName
    }`

    return (
        <ListItem
            button
            className={classes.item}
            dense={true}
            onClick={handleClick}
            selected={selected}
        >
            <ListItemIcon>
                <PacketBadge packet={packet} count={count} />
            </ListItemIcon>
            <ListItemText
                primary={<Box textOverflow="ellipsis">{primary}</Box>}
                secondary={secondary}
            />
        </ListItem>
    )
}
