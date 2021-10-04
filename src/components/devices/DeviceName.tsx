import { Typography } from "@material-ui/core"
import { Link } from "gatsby-material-ui-components"
import React from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import { identifierToUrlPath } from "../../../jacdac-ts/src/jdom/spec"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import useDeviceName from "./useDeviceName"

export default function DeviceName(props: {
    device: JDDevice
    serviceIndex?: number
    expanded?: boolean
    showShortId?: boolean
    linkToSpecification?: boolean
}) {
    const { device, serviceIndex, showShortId, linkToSpecification } = props
    const specification = useDeviceSpecification(device)
    const name = useDeviceName(device) || ""
    const { shortId } = device
    const Name = () => (
        <span>
            <span>{name}</span>
            {!name && showShortId && shortId}
            {showShortId && name && name !== shortId && (
                <Typography component="span" variant="body2" spellCheck={false}>
                    {" "}
                    {shortId}
                </Typography>
            )}
            {serviceIndex !== undefined && `[${serviceIndex}]`}
        </span>
    )
    if (linkToSpecification && specification)
        return (
            <Link
                color="textPrimary"
                to={`/devices/${identifierToUrlPath(specification.id)}`}
            >
                <Name />
            </Link>
        )
    else return <Name />
}
