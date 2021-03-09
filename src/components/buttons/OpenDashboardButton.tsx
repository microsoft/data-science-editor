import { Badge } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import JacdacIcon from "../icons/JacdacIcon";
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip";
import useDeviceCount from "../hooks/useDeviceCount"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context";
import { DEVICE_ANNOUNCE, DEVICE_DISCONNECT } from "../../../jacdac-ts/src/jdom/constants";
import { JDDevice } from "../../../jacdac-ts/src/jdom/device";


export default function OpenDashboardButton(props: { className?: string }) {
    const { className } = props;
    const count = useDeviceCount({ ignoreSelf: true })

    return <IconButtonWithTooltip className={className} title="Device Dashboard"
        edge="start" color="inherit" to="/dashboard/">
        <Badge color="secondary" badgeContent={count}>
            <JacdacIcon />
        </Badge>
    </IconButtonWithTooltip>
}