import React from "react"
import useMakeCodeEditorExtension from "./MakeCodeEditorExtensionContext"
import DeviceSpecificationList from "../specification/DeviceSpecificationList"
import { Button } from "@mui/material"

export default function MakeCodeAddExtensionBox() {
    const { configuration, setConfiguration, device, target } =
        useMakeCodeEditorExtension()

    const handleClick = (dev: jdspec.DeviceSpec) => {
        setConfiguration({
            ...configuration,
            device: dev.id === configuration.device ? undefined : dev?.id,
        })
    }
    const handleClear = () =>
        setConfiguration({
            ...configuration,
            device: undefined,
        })

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
            {device && (
                <Button sx={{ mt: 2 }} onClick={handleClear} variant="outlined">
                    clear
                </Button>
            )}
        </>
    )
}
