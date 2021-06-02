import React from "react"
import { SoilMoistureReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useWidgetSize from "../widgets/useWidgetSize"
import useServiceServer from "../hooks/useServiceServer"
import SensorServer from "../../../jacdac-ts/src/servers/sensorserver"
import { Grid, Slider } from "@material-ui/core"
import SoilMoistureWidget from "../widgets/SoilMoistureWidget"
import useRegister from "../hooks/useRegister"

export default function DashboardSoilMoisture(props: DashboardServiceProps) {
    const { service, services, variant } = props
    const moistureReg = useRegister(service, SoilMoistureReg.Moisture)
    const [value] = useRegisterUnpackedValue<[number]>(moistureReg, props)
    const widgetSize = useWidgetSize(variant, services?.length)
    const server = useServiceServer<SensorServer<[number]>>(service)
    const color = server ? "secondary" : "primary"

    const hasValue = !isNaN(value)

    const onChange = (event: unknown, newValue: number | number[]): void => {
        const svalue = newValue as number
        server?.reading.setValues([svalue])
        moistureReg.refresh()
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <SoilMoistureWidget
                    value={value}
                    color={color}
                    size={widgetSize}
                />
            </Grid>
            {server && hasValue && (
                <Grid item xs>
                    <Slider
                        valueLabelDisplay="off"
                        min={0}
                        max={1}
                        step={0.05}
                        value={value}
                        onChange={onChange}
                        color={color}
                    />
                </Grid>
            )}
        </Grid>
    )
}
