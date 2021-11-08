import React, { useContext } from "react"
import Alert from "../ui/Alert"
import PacketsContext from "../PacketsContext"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import HistoryIcon from "@mui/icons-material/History"
import { Box, Chip, Tooltip, useTheme } from "@mui/material"
import PacketSpecification from "../specification/PacketSpecification"
import { printPacket } from "../../../jacdac-ts/src/jdom/pretty"
import PacketHeaderLayout from "../PacketHeaderLayout"
import {
    META_ACK,
    META_GET,
    META_NOT_IMPLEMENTED,
    META_PIPE,
    META_TRACE,
} from "../../../jacdac-ts/src/jdom/constants"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import PacketBadge from "../PacketBadge"
import PacketDataLayout from "../PacketDataLayout"
import PacketList from "../PacketList"
import ServiceSpecificationCard from "../specification/ServiceSpecificationCard"
import CopyButton from "../ui/CopyButton"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import PaperBox from "../ui/PaperBox"
import AppContext from "../AppContext"

function TraceCopyButton(props: { packet: Packet }) {
    const { packet } = props
    const { replayTrace, view } = useContext(PacketsContext)
    const handleCopy = async () => {
        const savedTrace = replayTrace || view.trace
        return `${toHex(packet.header)} ${toHex(packet.data)} ${printPacket(
            packet
        ).replace(/\r?\n/g, " ")}

${savedTrace.serializeToText(-100)}
`
    }
    return <CopyButton title="copy packet" onCopy={handleCopy} />
}

export default function PacketInspector() {
    const { selectedPacket: packet } = useContext(AppContext)
    const theme = useTheme()

    if (!packet)
        return (
            <Alert severity="info">
                Click on a packet in the <HistoryIcon /> packet list.
            </Alert>
        )

    const { decoded } = packet
    const { info, error } = decoded || {}
    const name = info?.name || packet.friendlyCommandName
    const ack = packet.meta[META_ACK] as Packet
    const { header, data } = packet
    const pipePackets = packet.meta[META_PIPE] as Packet[]
    const get = packet.meta[META_GET] as Packet
    const sentTrace = packet.meta[META_TRACE] as string
    const notImplemented = packet.meta[META_NOT_IMPLEMENTED] as Packet

    return (
        <>
            <h2>
                <PacketBadge packet={packet} />
                {`${name} ${packet.isCommand ? "to" : "from"} ${
                    packet.friendlyDeviceName
                }/${packet.friendlyServiceName}`}

                <TraceCopyButton packet={packet} />
            </h2>
            {packet.sender && <Chip label={`sender: ${packet.sender}`} />}
            {error && <Alert severity="error">{error}</Alert>}
            <PaperBox padding={0}>
                <pre>
                    <code>
                        <Box component="span" mr={theme.spacing(0.1)}>
                            <Tooltip title={"header"}>
                                <span>{toHex(header)}</span>
                            </Tooltip>
                        </Box>
                    </code>
                    <br />
                    <code>
                        <Box component="span" mr={theme.spacing(0.1)}>
                            <Tooltip title={"data"}>
                                <span>{toHex(data)}</span>
                            </Tooltip>
                        </Box>
                    </code>
                </pre>
            </PaperBox>
            <h3>Header</h3>
            <PacketHeaderLayout
                packet={packet}
                showSlots={true}
                showFlags={true}
                showCommands={true}
            />
            {!!data?.length && (
                <>
                    <h3>Data</h3>
                    <PacketDataLayout
                        packet={packet}
                        showHex={true}
                        showDecoded={true}
                        showJSON={true}
                        showUnpacked={true}
                    />
                </>
            )}
            {ack && (
                <>
                    <h3>Ack received</h3>
                    <PacketList packets={[ack]} />
                </>
            )}
            {notImplemented && (
                <>
                    <h3>Not implemented report</h3>
                    <PacketList packets={[notImplemented]} />
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
