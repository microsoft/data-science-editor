import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import React from "react"
import StyledTreeItem from "../ui/StyledTreeItem"
import { ControlAnnounceFlags } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import DeviceActions from "./DeviceActions"

export default function AnnounceFlagsTreeItem(props: { device: JDDevice, showIdentify?: boolean }) {
    const { device, showIdentify } = props
    const { announceFlags, id, deviceId, restartCounter, proxy } = device

    const text = [
        deviceId,
        proxy && "proxy",
        announceFlags & ControlAnnounceFlags.IsClient && "client",
        announceFlags & ControlAnnounceFlags.SupportsACK && "acks",
        announceFlags & ControlAnnounceFlags.SupportsBroadcast && "broadcast",
        announceFlags & ControlAnnounceFlags.SupportsFrames && "frames",
        (announceFlags & ControlAnnounceFlags.StatusLightRgbFade) ===
            ControlAnnounceFlags.StatusLightMono && "mono status LED",
        (announceFlags & ControlAnnounceFlags.StatusLightRgbFade) ===
            ControlAnnounceFlags.StatusLightRgbNoFade &&
            "rgb no fade status LED",
        (announceFlags & ControlAnnounceFlags.StatusLightRgbFade) ===
            ControlAnnounceFlags.StatusLightRgbFade && "rgb fade status LED",
        restartCounter < 0xf ? `restart#${restartCounter}` : undefined,
    ]
        .filter(f => !!f)
        .join(", ")

    return (
        <StyledTreeItem
            nodeId={`${id}:flags`}
            labelText={text}
            actions={
                <DeviceActions
                    device={device}
                    showReset={true}
                    showProxy={true}
                    hideIdentity={!showIdentify}
                />
            }
        ></StyledTreeItem>
    )
}
