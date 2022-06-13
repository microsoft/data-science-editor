import React from "react"
import useMakeCodeEditorExtension from "./MakeCodeEditorExtensionContext"
import DeviceSpecificationList from "../specification/DeviceSpecificationList"

export default function MakeCodeAddExtensionBox() {
    const { configuration, setConfiguration, device, target } =
        useMakeCodeEditorExtension()

    const handleClick = (dev: jdspec.DeviceSpec) => {
        setConfiguration({
            ...configuration,
            device: dev?.id,
        })
    }

    return (
        <>
            <DeviceSpecificationList
                makeCode={target?.id || "microbit"}
                header={device ? `Current accessory` : `Select accessory`}
                onDeviceClick={handleClick}
                hideChips={true}
                hideServices={true}
                devices={device ? [device] : undefined}
            />
        </>
    )
}
