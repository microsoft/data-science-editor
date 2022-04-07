import React, { useState } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import useDeviceImage from "../devices/useDeviceImage"

export default function LazyDeviceImage(props: { device: JDDevice }) {
    const { device } = props
    const specification = useDeviceSpecification(device)
    const imageUrl = useDeviceImage(specification, "lazy")
    const largeImageUrl = useDeviceImage(specification, "catalog")
    const [showLarge, setShowLarge] = useState(false)

    if (!imageUrl) return null

    const handleLargeLoaded = () => setShowLarge(true)

    return (
        <>
            <img
                alt="photograph of the device"
                style={{
                    width: "100%",
                    display: showLarge ? undefined : "none",
                }}
                src={largeImageUrl}
                onLoad={handleLargeLoaded}
            />
            {!showLarge && (
                <img
                    alt="large photograph of the device"
                    style={{
                        minHeight: "18rem",
                        width: "100%",
                        filter: "blur",
                    }}
                    src={imageUrl}
                />
            )}
        </>
    )
}
