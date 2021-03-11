import { Typography } from "@material-ui/core";
import React, { useRef } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device";
import useDeviceName from "../useDeviceName";
import { useEditable } from "use-editable"

export default function DeviceName(props: {
    device: JDDevice,
    serviceIndex?: number,
    expanded?: boolean,
    showShortId?: boolean
}) {
    const { device, serviceIndex, showShortId } = props
    const name = useDeviceName(device) || ""
    const nameRef = useRef<HTMLSpanElement>()
    const { shortId } = device

    useEditable(nameRef, (newName) => { device.name = newName }, { disabled: !device });

    return <span>
        <span ref={nameRef}>{name}</span>
        {!name && showShortId && shortId}
        {showShortId && name && name !== shortId &&
            <Typography component="span" variant="body2" spellCheck={false}> {shortId}</Typography>}
        {serviceIndex !== undefined && `[${serviceIndex}]`}
    </span>
}