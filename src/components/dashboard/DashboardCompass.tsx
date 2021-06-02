import React from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useServiceServer from "../hooks/useServiceServer"
import { Grid, Slider } from "@material-ui/core"
import SensorServer from "../../../jacdac-ts/src/servers/sensorserver"
import {
    CompassReg,
    SystemStatusCodes,
} from "../../../jacdac-ts/src/jdom/constants"
import PowerButton from "../widgets/PowerButton"
import LoadingProgress from "../ui/LoadingProgress"
import useRegister from "../hooks/useRegister"

export default function DashboardCompass(props: DashboardServiceProps) {
    const { service } = props

    const headingRegister = useRegister(service, CompassReg.Heading)
    const enabledRegister = useRegister(service, CompassReg.Enabled)
    const [heading] = useRegisterUnpackedValue<[number]>(headingRegister, props)
    const enabled = useRegisterBoolValue(enabledRegister, props)
    const [status] = useRegisterUnpackedValue<[SystemStatusCodes, number]>(
        service.statusCodeRegister,
        props
    )
    const off = !enabled

    const server = useServiceServer<SensorServer<[number]>>(service)
    const color = server ? "secondary" : "primary"
    const { background, controlBackground, active, textProps } =
        useWidgetTheme(color)

    if (heading === undefined) return <LoadingProgress />

    const calibrating = status === SystemStatusCodes.Calibrating

    const w = 64
    const h = 64
    const mw = 5
    const r = (w >> 1) - 4
    const sw = 3
    const cx = w >> 1
    const cy = h >> 1
    const sp = 1
    const pr = 5
    const pri = 3

    const handleChange = async (ev: unknown, newValue: number | number[]) => {
        await server?.reading.setValues([newValue as number])
        headingRegister.refresh()
    }
    const valueDisplay = (angle: number) => `${Math.round(angle)}°`
    const toggleOff = () => enabledRegister.sendSetBoolAsync(off, true)

    return (
        <Grid container direction="column">
            <Grid item xs={12}>
                <SvgWidget width={w} height={h}>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill={controlBackground}
                        stroke={background}
                        strokeWidth={sw}
                    />
                    <g
                        transform={`rotate(${off ? 0 : heading}, ${w >> 1}, ${
                            h >> 1
                        })`}
                    >
                        <path
                            d={`M ${cx - mw} ${
                                cy + sp / 2
                            } l ${mw} ${r} l ${mw} ${-r} z`}
                            fill={background}
                            stroke={background}
                            strokeWidth={sp}
                        />
                        <path
                            d={`M ${cx - mw} ${
                                cy - sp / 2
                            } l ${mw} ${-r} l ${mw} ${r} z`}
                            stroke={background}
                            fill={off ? controlBackground : active}
                            strokeWidth={sp}
                        />
                    </g>
                    {calibrating && (
                        <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            opacity={0.9}
                            fill={background}
                        />
                    )}
                    {calibrating && (
                        <text x={cx} y={cy} fontSize={8} {...textProps}>
                            calibrating
                        </text>
                    )}
                    <PowerButton
                        r={pr}
                        ri={pri}
                        cx={w - pr - 1}
                        cy={h - pr - 1}
                        color={color}
                        strokeWidth={1}
                        off={off}
                        onClick={toggleOff}
                    />
                </SvgWidget>
            </Grid>
            {server && (
                <Grid item>
                    <Slider
                        color={color}
                        valueLabelDisplay="auto"
                        valueLabelFormat={valueDisplay}
                        min={0}
                        max={360}
                        step={1}
                        value={heading}
                        onChange={handleChange}
                        aria-label="heading"
                    />
                </Grid>
            )}
        </Grid>
    )
}
