import { List } from "@mui/material"
import React from "react"
import { Packet } from "../../../jacdac-ts/src/jdom/packet"
import PacketListItem from "../PacketListItem"

export default function TraceView(props: { packets: Packet[] }) {
    const { packets } = props
    return (
        <List>
            {packets.map(packet => (
                <PacketListItem
                    key={packet.key}
                    packet={packet}
                    count={1}
                    showTime={true}
                />
            ))}
        </List>
    )
}
