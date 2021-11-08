import { Badge } from "@mui/material"
import React from "react"
import { SRV_LOGGER } from "../../jacdac-ts/jacdac-spec/dist/specconstants"
import Packet from "../../jacdac-ts/src/jdom/packet"
import KindIcon from "./KindIcon"
import LogMessageIcon from "./LogMessageIcon"
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import ClearIcon from "@mui/icons-material/Clear"
import {
    CRC_ACK_NODE_NAME,
    META_ACK,
    META_ACK_FAILED,
    META_GET,
    META_NOT_IMPLEMENTED,
} from "../../jacdac-ts/src/jdom/constants"
import CodeIcon from "@mui/icons-material/Code"
import Tooltip from "./ui/Tooltip"
import ErrorIcon from "@mui/icons-material/Error"
import WarningIcon from "@mui/icons-material/Warning"

export default function PacketBadge(props: { packet: Packet; count?: number }) {
    const { packet, count } = props
    const { decoded } = packet
    const { error } = decoded || {}
    const requiredAck = !!packet.requiresAck
    const failedAck = !!packet.meta[META_ACK_FAILED]
    const receivedAck = !failedAck && !!packet.meta[META_ACK]
    const getPacket = !!packet.meta[META_GET]
    const notImplemented = !!packet.meta[META_NOT_IMPLEMENTED]
    const direction = packet.isCommand ? "to" : "from"
    const logMessage =
        packet.serviceClass === SRV_LOGGER &&
        packet.isReport &&
        !packet.isRegisterGet

    return (
        <Badge badgeContent={count}>
            {error && (
                <Tooltip title={error}>
                    <span>
                        <ErrorIcon color="error" />
                    </span>
                </Tooltip>
            )}
            {notImplemented && (
                <Tooltip title={"not implemented"}>
                    <span>
                        <WarningIcon color="warning" />
                    </span>
                </Tooltip>
            )}
            {getPacket && !failedAck && !receivedAck && (
                <Tooltip title={`to/from ${packet.friendlyDeviceName}`}>
                    <span>
                        <CodeIcon />
                    </span>
                </Tooltip>
            )}
            {direction === "to" && !getPacket && !failedAck && !receivedAck && (
                <Tooltip title={`to ${packet.friendlyDeviceName}`}>
                    <span>
                        <ArrowLeftIcon />
                    </span>
                </Tooltip>
            )}
            {direction === "from" && !getPacket && !failedAck && !receivedAck && (
                <Tooltip title={`from ${packet.friendlyDeviceName}`}>
                    <span>
                        <ArrowRightIcon />
                    </span>
                </Tooltip>
            )}
            {requiredAck === true && failedAck && (
                <Tooltip title="no ack">
                    <span>
                        <ClearIcon />
                    </span>
                </Tooltip>
            )}
            {requiredAck === true && receivedAck && (
                <Tooltip title="ack received">
                    <span>
                        <KindIcon kind={CRC_ACK_NODE_NAME} />
                    </span>
                </Tooltip>
            )}
            {logMessage ? (
                <LogMessageIcon identifier={decoded?.info.identifier} />
            ) : (
                <KindIcon
                    kind={
                        packet.isCRCAck
                            ? "crc_ack"
                            : packet.isPipe
                            ? "pipe"
                            : packet.isAnnounce
                            ? "announce"
                            : decoded?.info.kind
                    }
                />
            )}
        </Badge>
    )
}
