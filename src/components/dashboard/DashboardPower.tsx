import React from "react"
import {
    PowerPowerStatus,
    PowerReg,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import SvgWidget from "../widgets/SvgWidget"
import useServiceServer from "../hooks/useServiceServer"
import ReflectedLightServer from "../../../jacdac-ts/src/servers/reflectedlightserver"
import PowerButton from "../widgets/PowerButton"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useRegister from "../hooks/useRegister"
import LoadingProgress from "../ui/LoadingProgress"
import { humanify } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"

export default function DashboardPower(props: DashboardServiceProps) {
    const { service } = props

    const allowedRegister = useRegister(service, PowerReg.Allowed)
    const powerStatusRegister = useRegister(service, PowerReg.PowerStatus)
    const batteryChargeRegister = useRegister(service, PowerReg.BatteryCharge)

    const allowed = useRegisterBoolValue(allowedRegister, props)
    const [powerStatus] = useRegisterUnpackedValue<[PowerPowerStatus]>(
        powerStatusRegister,
        props
    )
    const [batteryCharge] = useRegisterUnpackedValue<[number]>(
        batteryChargeRegister,
        props
    )

    const server = useServiceServer<ReflectedLightServer>(service)
    const color = server ? "secondary" : "primary"
    const { background, active, textProps } = useWidgetTheme(color)

    if (powerStatus === undefined) return <LoadingProgress />

    const w = 64
    const h = w + 16
    const r = (w - 4) >> 1
    const ro = r - 4
    const ri = ro - 8
    const off = powerStatus === PowerPowerStatus.Disallowed
    const label = off
        ? "off"
        : humanify(PowerPowerStatus[powerStatus]?.toLowerCase())

    const mw = 2
    const bw = 12
    const hw = 4
    const rw = mw / 2

    const toggleEnabled = () => allowedRegister.sendSetBoolAsync(!allowed, true)
    const widgetSize = `clamp(3rem, 10vw, 10vh)`

    return (
        <SvgWidget width={w} height={h} size={widgetSize}>
            <g>
                <PowerButton
                    cx={w / 2}
                    cy={w / 2}
                    r={ro}
                    ri={ri}
                    off={off}
                    color={color}
                    label={label}
                    borderStroke={
                        (powerStatus === PowerPowerStatus.Overload ||
                            powerStatus === PowerPowerStatus.Overprovision) &&
                        "red"
                    }
                    onClick={toggleEnabled}
                />
                {batteryCharge !== undefined && (
                    <g>
                        <title>{`battery charge ${Math.floor(
                            batteryCharge * 100
                        )}%`}</title>
                        <rect
                            x={w - bw - mw}
                            y={mw}
                            width={bw * batteryCharge}
                            height={hw}
                            rx={rw}
                            ry={rw}
                            fill={active}
                        />
                        <rect
                            x={w - bw - mw}
                            y={mw}
                            width={bw}
                            height={hw}
                            rx={rw}
                            ry={rw}
                            fill={"none"}
                            stroke={background}
                            strokeWidth={1}
                        />
                        <text
                            x={w - 2 * mw}
                            y={mw + hw / 2}
                            {...textProps}
                            textAnchor="end"
                            fontSize={hw * 0.6}
                        >
                            {Math.floor(batteryCharge * 100)}%
                        </text>
                    </g>
                )}
            </g>
        </SvgWidget>
    )
}
