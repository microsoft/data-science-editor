import { Paper } from "@mui/material"
import React, { useContext } from "react"
import { serviceName } from "../../jacdac-ts/src/jdom/pretty"
import {
    SensorAggregatorConfig,
    SensorAggregatorInputConfig,
} from "../../jacdac-ts/src/clients/sensoraggregatorclient"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import DeviceName from "./devices/DeviceName"

function SensorAggregatorInputConfigView(props: {
    input: SensorAggregatorInputConfig
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { input } = props
    const { serviceClass, deviceId, serviceIndex } = input

    const device = deviceId && bus.device(deviceId)

    return (
        <>
            {serviceName(serviceClass)}
            {device && (
                <DeviceName device={device} serviceIndex={serviceIndex} />
            )}
            {!device && deviceId && (
                <span>
                    {deviceId}[{serviceIndex}]
                </span>
            )}
            {!deviceId && <span>/ any device</span>}
        </>
    )
}

export default function SensorAggregatorConfigView(props: {
    config: SensorAggregatorConfig
}) {
    const { config } = props

    if (!config?.inputs) return <></>

    return (
        <Paper>
            <ul>
                <li>
                    samples interval (ms):{" "}
                    <code>{config.samplingInterval}</code>
                </li>
                <li>
                    samples window (# samples):{" "}
                    <code>{config.samplesInWindow}</code>
                </li>
                <li>
                    inputs ({config.inputs.length})
                    <ul>
                        {config.inputs.map((input, i) => (
                            <li key={"input" + i}>
                                <SensorAggregatorInputConfigView
                                    input={input}
                                />
                            </li>
                        ))}
                    </ul>
                </li>
            </ul>
        </Paper>
    )
}
