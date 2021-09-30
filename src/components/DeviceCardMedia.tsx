import React from "react"
import JDDevice from "../../jacdac-ts/src/jdom/device"
import useDeviceSpecification from "../jacdac/useDeviceSpecification"
import useDeviceImage from "./devices/useDeviceImage"
import CardMediaWithSkeleton from "./ui/CardMediaWithSkeleton"

export default function DeviceCardMedia(props: { device: JDDevice }) {
    const { device } = props
    const specification = useDeviceSpecification(device)
    const imageUrl = useDeviceImage(specification, "preview")

    return (
        <CardMediaWithSkeleton image={imageUrl} title={specification?.name} />
    )
}
