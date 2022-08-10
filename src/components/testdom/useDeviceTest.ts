import { useEffect, useState } from "react"
import {
    DeviceTestSpec,
    OracleTestSpec,
} from "../../../jacdac-ts/src/testdom/spec"
import { DeviceTest } from "../../../jacdac-ts/src/testdom/nodes"
import { createDeviceTest } from "../../../jacdac-ts/src/testdom/compiler"
import useBus from "../../jacdac/useBus"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"

export default function useDeviceTest(
    device: JDDevice,
    deviceSpec: DeviceTestSpec,
    oracles?: OracleTestSpec[]
) {
    const bus = useBus()
    const [test, setTest] = useState<DeviceTest>(undefined)
    useEffect(() => {
        if (deviceSpec) {
            try {
                const p = createDeviceTest(bus, deviceSpec, oracles)
                if (p) p.device = device
                setTest(p)
                return () => (p.device = undefined)
            } catch (e) {
                console.debug(e)
            }
        }
        setTest(undefined)
        return undefined
    }, [deviceSpec, oracles])
    return test
}
