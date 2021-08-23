import { MenuItem } from "@material-ui/core"
import React, { ChangeEvent, useContext } from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import SelectWithLabel from "../ui/SelectWithLabel"

export default function SelectDevice(props: {
    devices: JDDevice[]
    deviceId: string
    onChange: (newDeviceId: string) => void
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { devices, deviceId, onChange } = props

    const handleDeviceChange = async (
        ev: ChangeEvent<{ name?: string; value: unknown }>
    ) => {
        const id = ev.target.value as string
        onChange(id)
        const device = bus.node(id) as JDDevice
        await device?.identify()
    }
    return (
        <SelectWithLabel
            helperText="choose a device"
            value={deviceId}
            onChange={handleDeviceChange}
            disabled={!devices?.length}
        >
            {devices?.map(dev => (
                <MenuItem key={dev.id} value={dev.id}>
                    {dev.describe()}
                </MenuItem>
            ))}
        </SelectWithLabel>
    )
}
