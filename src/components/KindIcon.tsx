import React from "react"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import CreateIcon from "@mui/icons-material/Create"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import LockIcon from "@mui/icons-material/Lock"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import CallToActionIcon from "@mui/icons-material/CallToAction"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import FlashOnIcon from "@mui/icons-material/FlashOn"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DataUsageIcon from "@mui/icons-material/DataUsage"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ReplyIcon from "@mui/icons-material/Reply"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeviceUnknownIcon from "@mui/icons-material/DeviceUnknown"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeviceHubIcon from "@mui/icons-material/DeviceHub"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import BubbleChartIcon from "@mui/icons-material/BubbleChart"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ComputerIcon from "@mui/icons-material/Computer"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import BlurLinearIcon from "@mui/icons-material/BlurLinear"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import GradientIcon from "@mui/icons-material/Gradient"

import {
    PACKET_KIND_RO,
    PACKET_KIND_RW,
    CONST_NODE_NAME,
    COMMAND_NODE_NAME,
    REPORT_NODE_NAME,
    BUS_NODE_NAME,
    DEVICE_NODE_NAME,
    VIRTUAL_DEVICE_NODE_NAME,
    SERVICE_NODE_NAME,
    EVENT_NODE_NAME,
    PIPE_NODE_NAME,
    CRC_ACK_NODE_NAME,
    PIPE_REPORT_NODE_NAME,
    PACKET_KIND_ANNOUNCE,
    SERVICE_TEST_NODE_NAME,
    SERVICE_MIXIN_NODE_NAME,
} from "../../jacdac-ts/src/jdom/constants"
import JacdacIcon from "./icons/JacdacIcon"

export default function KindIcon(props: {
    kind: string
    className?: string
    fontSize?: "small" | "default" | "inherit" | "large"
}) {
    const { kind, ...rest } = props
    let icon: JSX.Element
    switch (kind) {
        case PACKET_KIND_RO:
            icon = <DataUsageIcon {...rest} />
            break
        case PACKET_KIND_RW:
            icon = <CreateIcon {...rest} />
            break
        case PACKET_KIND_ANNOUNCE:
            icon = <NotificationsNoneIcon {...rest} />
            break
        case CONST_NODE_NAME:
            icon = <LockIcon {...rest} />
            break
        case COMMAND_NODE_NAME:
            icon = <CallToActionIcon {...rest} />
            break
        case EVENT_NODE_NAME:
            icon = <FlashOnIcon {...rest} />
            break
        case REPORT_NODE_NAME:
            icon = <ReplyIcon {...rest} />
            break
        case BUS_NODE_NAME:
            icon = <DeviceHubIcon {...rest} />
            break
        case DEVICE_NODE_NAME:
            icon = <JacdacIcon {...rest} />
            break
        case VIRTUAL_DEVICE_NODE_NAME:
            icon = <ComputerIcon {...rest} />
            break
        case SERVICE_NODE_NAME:
            icon = <BubbleChartIcon {...rest} />
            break
        case SERVICE_MIXIN_NODE_NAME:
            icon = <GradientIcon {...rest} />
            break
        case PIPE_NODE_NAME:
            icon = <BlurLinearIcon {...rest} />
            break
        case PIPE_REPORT_NODE_NAME:
            icon = <BlurLinearIcon {...rest} />
            break
        case CRC_ACK_NODE_NAME:
            icon = <ConfirmationNumberIcon {...rest} />
            break
        case SERVICE_TEST_NODE_NAME:
            icon = <CheckCircleIcon {...rest} />
            break
        default:
            icon = <DeviceUnknownIcon {...rest} />
            break
    }
    return icon
}

export function kindName(kind: string) {
    switch (kind) {
        case PACKET_KIND_RO:
            return "read only"
        case PACKET_KIND_RW:
            return "read write"
        case VIRTUAL_DEVICE_NODE_NAME:
            return "simulated device"
        default:
            return kind
    }
}

export function allKinds() {
    return [
        REPORT_NODE_NAME,
        PACKET_KIND_RW,
        PACKET_KIND_RO,
        CONST_NODE_NAME,
        EVENT_NODE_NAME,
        COMMAND_NODE_NAME,
    ]
}
