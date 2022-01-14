import { List } from "@mui/material"
import React from "react"
import { Packet } from "../../jacdac-ts/src/jdom/packet"
import PacketListItem from "./PacketListItem"

export default function PacketList(props: {
    packets: Packet[]
    showRaw?: boolean
    showTime?: boolean
}) {
    const { packets, showRaw, showTime } = props
    return (
        <List>
            {packets
                ?.filter(pkt => !!pkt)
                .map(pkt => (
                    <PacketListItem
                        key={pkt.key}
                        packet={pkt}
                        showTime={showTime}
                        showRaw={showRaw}
                    />
                ))}
        </List>
    )
}
