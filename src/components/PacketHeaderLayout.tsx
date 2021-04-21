import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
} from "@material-ui/core"
import React from "react"
import { getNumber, NumberFormat } from "../../jacdac-ts/src/jdom/buffer"
import {
    JD_FRAME_FLAG_ACK_REQUESTED,
    JD_FRAME_FLAG_COMMAND,
    JD_FRAME_FLAG_IDENTIFIER_IS_SERVICE_CLASS,
    JD_SERVICE_INDEX_CRC_ACK,
    JD_SERVICE_INDEX_PIPE,
} from "../../jacdac-ts/src/jdom/constants"
import Packet from "../../jacdac-ts/src/jdom/packet"
import { fromHex, toHex } from "../../jacdac-ts/src/jdom/utils"
import PaperBox from "./ui/PaperBox"
import Tooltip from "./ui/Tooltip"

interface SlotProps {
    offset: number
    size: number
    format?: NumberFormat
    formatHex?: boolean
    name: string
    description: string
    know?: { [index: string]: string | number }
}

function HeaderMap(props: { header: Uint8Array } & SlotProps) {
    const { header, offset, size, name } = props
    const bytes = header.slice(offset, offset + size)
    return (
        <Tooltip title={name}>
            <span>{toHex(bytes)}</span>
        </Tooltip>
    )
}

export default function PacketHeaderLayout(props: {
    packet?: Packet
    data?: string
    showSlots?: boolean
    showFlags?: boolean
}) {
    const { packet, data, showSlots, showFlags } = props
    const theme = useTheme()
    const pkt = packet || Packet.fromBinary(fromHex(data))
    const { header } = pkt
    const frameFlags = header[3]

    const slots: SlotProps[] = [
        {
            offset: 0,
            size: 2,
            format: NumberFormat.UInt16LE,
            formatHex: true,
            name: "frame_crc",
            description: "CRC",
        },
        {
            offset: 2,
            size: 1,
            format: NumberFormat.UInt8LE,
            name: "frame_size",
            description: "Size of the data field in bytes.",
        },
        {
            offset: 3,
            size: 1,
            name: "frame_flags",
            description: "Flags specific to this frame.",
        },
        {
            offset: 4,
            size: 8,
            formatHex: true,
            name: "device_identifiter",
            description: "64-bit device identifier",
        },

        {
            offset: 12,
            size: 1,
            format: NumberFormat.UInt8LE,
            name: "packet_size",
            description:
                "The size of the payload field. Maximum size is 236 bytes.",
        },
        {
            offset: 13,
            size: 1,
            format: NumberFormat.UInt8LE,
            name: "service_number",
            know: {
                [JD_SERVICE_INDEX_PIPE.toString(16)]: "pipe",
                [JD_SERVICE_INDEX_CRC_ACK.toString(16)]: "crc ack",
            },
            description:
                "A number that specifies an operation and code combination.",
        },
        {
            offset: 14,
            size: 2,
            format: NumberFormat.UInt16LE,
            formatHex: true,
            name: "service_command",
            description: "Identifier for the command",
        },
    ]

    const flags = [
        {
            position: 1,
            flag: JD_FRAME_FLAG_COMMAND,
            name: "COMMAND",
            description:
                "Determines if the frame contains command or report packets. If set, the frame contains command packets, if not set, the frame contains report packets.",
        },
        {
            position: 2,
            flag: JD_FRAME_FLAG_ACK_REQUESTED,
            name: "ACK_REQUESTED",
            description:
                "Determines if the receiver should return an ACK to the sender. If set, the receiver should repsond with an ACK frame, if not set, no response is required.",
        },
        {
            position: 4,
            flag: JD_FRAME_FLAG_IDENTIFIER_IS_SERVICE_CLASS,
            name: "IDENTIFIER_IS_SERVICE_CLASS",
            description:
                "The packet is a multi command. The service class is the first 4 bytes of the device id.",
        },
    ].filter(f => frameFlags & f.flag)

    return (
        <>
            <PaperBox key="header" padding={0}>
                <pre>
                    <code>
                        {slots.map(slot => (
                            <Box
                                component="span"
                                key={slot.name}
                                mr={theme.spacing(0.1)}
                            >
                                <HeaderMap header={header} {...slot} />
                            </Box>
                        ))}
                    </code>
                </pre>
            </PaperBox>
            {showSlots && (
                <PaperBox key="slots">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Bytes</TableCell>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Offset</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {slots.map(slot => {
                                    const buf = header.slice(
                                        slot.offset,
                                        slot.offset + slot.size
                                    )
                                    const value =
                                        slot.format &&
                                        getNumber(buf, slot.format, 0)
                                    const known = slot.know?.[toHex(buf)]
                                    return (
                                        <TableRow key={slot.name}>
                                            <TableCell>
                                                <code>{toHex(buf)}</code>
                                            </TableCell>
                                            <TableCell>
                                                {value !== undefined &&
                                                slot.formatHex
                                                    ? `0x${value.toString(16)}`
                                                    : value}
                                                {known && (
                                                    <code>({known})</code>
                                                )}
                                            </TableCell>
                                            <TableCell>{slot.offset}</TableCell>
                                            <TableCell>{slot.size}</TableCell>
                                            <TableCell>{slot.name}</TableCell>
                                            <TableCell>
                                                {slot.description}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </PaperBox>
            )}
            {showFlags && !!flags.length && (
                <PaperBox key="flags">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Flag</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {flags.map(flag => (
                                    <TableRow key={flag.name}>
                                        <TableCell>
                                            <code>{flag.position}</code>
                                        </TableCell>
                                        <TableCell>{flag.name}</TableCell>
                                        <TableCell>
                                            {flag.description}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </PaperBox>
            )}
        </>
    )
}
