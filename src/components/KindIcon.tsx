import React from "react"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import CreateIcon from "@material-ui/icons/Create"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import LockIcon from "@material-ui/icons/Lock"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import CallToActionIcon from "@material-ui/icons/CallToAction"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import FlashOnIcon from "@material-ui/icons/FlashOn"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DataUsageIcon from "@material-ui/icons/DataUsage"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ReplyIcon from "@material-ui/icons/Reply"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeviceUnknownIcon from "@material-ui/icons/DeviceUnknown"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeviceHubIcon from "@material-ui/icons/DeviceHub"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import BubbleChartIcon from "@material-ui/icons/BubbleChart"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ComputerIcon from "@material-ui/icons/Computer"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import BlurLinearIcon from "@material-ui/icons/BlurLinear"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import CheckCircleIcon from "@material-ui/icons/CheckCircle"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SettingsIcon from "@material-ui/icons/Settings"

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

export default function KindIcon(props: { kind: string; className?: string, fontSize?: "small" | "default" | "inherit" | "large" }) {
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
            icon = <SettingsIcon {...rest} />
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
