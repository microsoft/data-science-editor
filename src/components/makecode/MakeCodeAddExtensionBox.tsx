import React from "react"
import useMakeCodeEditorExtension from "./MakeCodeEditorExtensionContext"
import DeviceSpecificationList from "../specification/DeviceSpecificationList"

export default function MakeCodeAddExtensionBox() {
    const { configuration, setConfiguration, device, target } =
        useMakeCodeEditorExtension()

    const handleClick = (dev: jdspec.DeviceSpec) => {
        setConfiguration({
            ...configuration,
            device: dev.id === configuration.device ? undefined : dev?.id,
        })
    }

    return (
        <DeviceSpecificationList
            makeCode={target?.id || "microbit"}
            header={`Select your accessory (current: ${
                device?.name || "none"
            })`}
            onDeviceClick={handleClick}
            hideChips={true}
            hideServices={true}
        />
    )
}
