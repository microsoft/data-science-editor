import React, { useContext } from "react"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import { Badge } from "@material-ui/core";
import JacdacContext, { JacdacContextProps } from "../jacdac/Context";
import { DEVICE_CHANGE, DEVICE_FIRMWARE_INFO, FIRMWARE_BLOBS_CHANGE } from "../../jacdac-ts/src/jdom/constants";
import useEventRaised from "../jacdac/useEventRaised";
import { computeUpdates } from "../../jacdac-ts/src/jdom/flashing";
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip";

export default function FlashButton(props: { className?: string }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const updates = useEventRaised([FIRMWARE_BLOBS_CHANGE, DEVICE_FIRMWARE_INFO, DEVICE_CHANGE],
        bus,
        b => computeUpdates(b.devices({ ignoreSelf: true, announced: true })
            .map(d => d.firmwareInfo), bus.firmwareBlobs)
    )

    if (!updates?.length)
        return <></>

    const title = `Firmware update ${updates.length} available`;
    return <IconButtonWithTooltip
        title={title} {...props}
        color="inherit"
        to="/tools/updater"
        edge="start">
        <Badge badgeContent={updates.length} color="secondary">
            <SystemUpdateAltIcon />
        </Badge>
    </IconButtonWithTooltip>
}