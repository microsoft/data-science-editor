import React from "react"
import { SoilMoistureReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useWidgetSize from "../widgets/useWidgetSize"
import useServiceHost from "../hooks/useServiceHost"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import SensorServiceHost from "../../../jacdac-ts/src/hosts/sensorservicehost"
import { useId } from "react-use-id-hook"
import { Grid, Slider } from "@material-ui/core"

export default function DashboardSoilMoisture(props: DashboardServiceProps) {
    const { service, services, variant } = props
    const moistureReg = service.register(SoilMoistureReg.Moisture)
    const [value] = useRegisterUnpackedValue<[number]>(moistureReg)
    const widgetSize = useWidgetSize(variant, services.length)
    const host = useServiceHost<SensorServiceHost<[number]>>(service)
    const color = host ? "secondary" : "primary"
    const { active, background, controlBackground, textProps } = useWidgetTheme(
        color
    )
    const clipId = useId()

    const hasValue = !isNaN(value)
    const tvalue = hasValue ? `${Math.round(value * 100)}%` : `--`

    const w = 5
    const h = 9.488
    const cm = 3.3
    const ch = (h - cm) * ((0.12 + value) / 1.12)
    const onChange = (event: unknown, newValue: number | number[]): void => {
        const svalue = newValue as number
        host?.reading.setValues([svalue])
        moistureReg.refresh()
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <SvgWidget width={w} height={h} size={widgetSize}>
                    {hasValue && (
                        <defs>
                            <clipPath id={clipId}>
                                <rect x={0} y={h - ch} width={w} height={ch} />
                            </clipPath>
                        </defs>
                    )}
                    <path
                        fill={background}
                        d="M4.812 7.997V.5a.5.5 0 00-.5-.5H.689a.5.5 0 00-.5.5v7.497l.503 1.491h.466l.503-1.491V3.373a.792.792 0 01.84-.791.792.792 0 01.838.79v4.625l.503 1.491h.466z"
                    />
                    <path
                        fill={active}
                        d="M4.812 7.997V.5a.5.5 0 00-.5-.5H.689a.5.5 0 00-.5.5v7.497l.503 1.491h.466l.503-1.491V3.373a.792.792 0 01.84-.791.792.792 0 01.838.79v4.625l.503 1.491h.466z"
                        clipPath={`url(#${clipId})`}
                    />
                    <path
                        fill={controlBackground}
                        d="M4.075 8.548a.075.075 0 100-.15.075.075 0 100 .15zM4.425 7.281a.075.075 0 100-.15.075.075 0 100 .15zM4.425 5.948a.075.075 0 100-.15.075.075 0 100 .15zM3.725 4.614a.075.075 0 100-.15.075.075 0 100 .15zM3.725 3.948a.075.075 0 100-.15.075.075 0 100 .15zM3.725 5.281a.075.075 0 100-.15.075.075 0 100 .15zM4.425 6.614a.075.075 0 100-.15.075.075 0 100 .15zM4.425 7.948a.075.075 0 100-.15.075.075 0 100 .15zM3.725 7.281a.075.075 0 100-.15.075.075 0 100 .15zM3.725 5.948a.075.075 0 100-.15.075.075 0 100 .15zM4.425 4.614a.075.075 0 100-.15.075.075 0 100 .15zM4.425 3.948a.075.075 0 100-.15.075.075 0 100 .15zM4.425 5.281a.075.075 0 100-.15.075.075 0 100 .15zM3.725 6.614a.075.075 0 100-.15.075.075 0 100 .15zM3.725 7.948a.075.075 0 100-.15.075.075 0 100 .15zM.925 8.548a.075.075 0 100-.15.075.075 0 100 .15zM.575 7.281a.075.075 0 100-.15.075.075 0 100 .15zM.575 5.948a.075.075 0 100-.15.075.075 0 100 .15zM1.275 4.614a.075.075 0 100-.15.075.075 0 100 .15zM1.275 3.948a.075.075 0 100-.15.075.075 0 100 .15zM1.275 5.281a.075.075 0 100-.15.075.075 0 100 .15zM.575 6.614a.075.075 0 100-.15.075.075 0 100 .15zM.575 7.948a.075.075 0 100-.15.075.075 0 100 .15zM1.275 7.281a.075.075 0 100-.15.075.075 0 100 .15zM1.275 5.948a.075.075 0 100-.15.075.075 0 100 .15zM.575 4.614a.075.075 0 100-.15.075.075 0 100 .15zM.575 3.948a.075.075 0 100-.15.075.075 0 100 .15zM.575 5.281a.075.075 0 100-.15.075.075 0 100 .15zM1.275 6.614a.075.075 0 100-.15.075.075 0 100 .15zM1.275 7.948a.075.075 0 100-.15.075.075 0 100 .15z"
                    />
                    <text
                        x={w / 2}
                        y="1.4"
                        fontSize="1.058"
                        strokeWidth=".026"
                        {...textProps}
                    >
                        {tvalue}
                    </text>
                </SvgWidget>
            </Grid>
            {host && hasValue && (
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
