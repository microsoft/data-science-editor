import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
} from "@mui/material"
import React from "react"
import { getNumber, NumberFormat } from "../../jacdac-ts/src/jdom/buffer"
import {
    CMD_EVENT_MASK,
    CMD_GET_REG,
    CMD_SET_REG,
    JD_FRAME_FLAG_ACK_REQUESTED,
    JD_FRAME_FLAG_COMMAND,
    JD_FRAME_FLAG_IDENTIFIER_IS_SERVICE_CLASS,
    JD_SERVICE_INDEX_CRC_ACK,
    JD_SERVICE_INDEX_PIPE,
} from "../../jacdac-ts/src/jdom/constants"
import { Packet } from "../../jacdac-ts/src/jdom/packet"
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
        <Tooltip title={name} sx={{ mr: 0.5 }}>
            <span>{toHex(bytes)}</span>
        </Tooltip>
    )
}

export default function PacketHeaderLayout(props: {
    packet?: Packet
    data?: string
    showSlots?: boolean
    showFlags?: boolean
    showCommands?: boolean
}) {
    const { packet, data, showSlots, showFlags, showCommands } = props
    const theme = useTheme()
    const pkt = packet || Packet.fromBinary(fromHex(data))
    const { header } = pkt
    const frameFlags = header[3]
    const multi = pkt.isMultiCommand
    const serviceCommand = pkt.serviceCommand

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
        multi && {
            offset: 4,
            size: 4,
            format: NumberFormat.UInt32LE,
            formatHex: true,
            name: "service_identifier",
            description: "multicast service identifier",
        },
        multi && {
            offset: 8,
            size: 4,
            formatHex: true,
            name: "ignored",
            description: "ignored in multicast",
        },
        !multi && {
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
            name: "service_index",
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
    ].filter(c => !!c)

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
    ].filter(f => (frameFlags & f.flag) === f.flag)

    const commandFlags = [
        {
            flag: CMD_GET_REG,
            active: (serviceCommand & CMD_GET_REG) === CMD_GET_REG,
            name: "CMD_GET_REG",
            description: "Get register value",
        },
        {
            flag: CMD_SET_REG,
            active: (serviceCommand & CMD_SET_REG) === CMD_SET_REG,
            name: "CMD_SET_REG",
            description: "Set register value",
        },
        {
            flag: CMD_EVENT_MASK,
            active: (serviceCommand & CMD_EVENT_MASK) !== 0,
            name: "CMD_EVENT_MASK",
            description: "Command is an event",
        },
    ].filter(f => f.active)

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
            {showCommands && !!commandFlags.length && (
                <PaperBox key="commandflags">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        Service command
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Flag</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {commandFlags.map(flag => (
                                    <TableRow key={flag.name}>
                                        <TableCell>
                                            <code>
                                                {(
                                                    "0000" +
                                                    flag.flag.toString(16)
                                                ).slice(-4)}
                                            </code>
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
            {showFlags && !!flags.length && (
                <PaperBox key="flags">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        Frame flags
                                    </TableCell>
                                </TableRow>
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
