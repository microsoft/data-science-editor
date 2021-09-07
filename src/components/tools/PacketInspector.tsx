import React, { useContext } from "react"
import Alert from "../ui/Alert"
import PacketsContext from "../PacketsContext"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import HistoryIcon from "@material-ui/icons/History"
import KindChip from "../KindChip"
import { Typography } from "@material-ui/core"
import PacketSpecification from "../specification/PacketSpecification"
import { prettyDuration, printPacket } from "../../../jacdac-ts/src/jdom/pretty"
import PacketHeaderLayout from "../PacketHeaderLayout"
import {
    META_ACK,
    META_GET,
    META_PIPE,
    META_TRACE,
} from "../../../jacdac-ts/src/jdom/constants"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import PacketBadge from "../PacketBadge"
import PacketDataLayout from "../PacketDataLayout"
import PacketList from "../PacketList"
import ServiceSpecificationCard from "../specification/ServiceSpecificationCard"

export default function PacketInspector() {
    const { selectedPacket: packet } = useContext(PacketsContext)

    if (!packet)
        return (
            <Alert severity="info">
                Click on a packet in the <HistoryIcon /> packet list.
            </Alert>
        )

    const { decoded } = packet
    const info = decoded?.info
    const name = info?.name || packet.friendlyCommandName
    const ack = packet.meta[META_ACK] as Packet
    const data = packet.data
    const pipePackets = packet.meta[META_PIPE] as Packet[]
    const get = packet.meta[META_GET] as Packet
    const sentTrace = packet.meta[META_TRACE] as string

    return (
        <>
            <h2>
                <PacketBadge packet={packet} />
                {`${name} ${packet.isCommand ? "to" : "from"} ${
                    packet.friendlyDeviceName
                }/${packet.friendlyServiceName}`}
            </h2>
            <div>
                {prettyDuration(packet.timestamp)},{" "}
                <KindChip kind={info?.kind} />, size {packet.size}
            </div>
            <Typography variant="body2">{printPacket(packet)}</Typography>
            {packet.sender && (
                <Typography variant="body2">sender: {packet.sender}</Typography>
            )}
            <h3>Header</h3>
            <PacketHeaderLayout
                packet={packet}
                showSlots={true}
                showFlags={true}
                showCommands={true}
            />
            {data && (
                <PacketDataLayout
                    packet={packet}
                    showHex={true}
                    showDecoded={true}
                    showJSON={true}
                    showUnpacked={true}
                />
            )}
            {ack && (
                <>
                    <h3>Ack received</h3>
                    <PacketList packets={[ack]} />
                </>
            )}
            {get && (
                <>
                    <h3>GET request</h3>
                    <PacketList packets={[get]} />
                </>
            )}
            {pipePackets && (
                <>
                    <h3>Pipe packets</h3>
                    <PacketList packets={pipePackets.filter(pp => !!pp)} />
                </>
            )}
            {info && (
                <>
                    <h3>Specification</h3>
                    <ServiceSpecificationCard
                        showServiceClass={true}
                        serviceClass={packet.serviceClass}
                        showReleaseStatus={true}
                    />
                    <PacketSpecification
                        serviceClass={packet.serviceClass}
                        packetInfo={info}
                    />
                </>
            )}
            {sentTrace && (
                <>
                    <h3>Sent trace</h3>
                    <pre>{sentTrace}</pre>
                </>
            )}
        </>
    )
}
