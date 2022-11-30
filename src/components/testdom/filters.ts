import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import {
    SRV_BOOTLOADER,
    SRV_BRIDGE,
    SRV_CONTROL,
    SRV_DASHBOARD,
    SRV_DC_CURRENT_MEASUREMENT,
    SRV_DC_VOLTAGE_MEASUREMENT,
    SRV_INFRASTRUCTURE,
    SRV_DEVICE_SCRIPT_CONDITION,
    SRV_LOGGER,
    SRV_POWER_SUPPLY,
    SRV_PROTO_TEST,
    SRV_PROXY,
    SRV_RELAY,
    SRV_ROLE_MANAGER,
    SRV_SETTINGS,
    SRV_UNIQUE_BRAIN,
} from "../../../jacdac-ts/src/jdom/constants"

const ignoredDevices = [
    SRV_UNIQUE_BRAIN,
    SRV_DASHBOARD,
    SRV_BRIDGE,
    SRV_INFRASTRUCTURE,
    SRV_PROXY,
]
const ignoredServices = [
    SRV_CONTROL,
    SRV_ROLE_MANAGER,
    SRV_LOGGER,
    SRV_SETTINGS,
    SRV_BOOTLOADER,
    SRV_PROTO_TEST,
    SRV_INFRASTRUCTURE,
    SRV_PROXY,
    SRV_UNIQUE_BRAIN,
    SRV_DASHBOARD,
    SRV_BRIDGE,
    SRV_DEVICE_SCRIPT_CONDITION,
]

export function isModuleTester(device: JDDevice) {
    return (
        device.announced &&
        device.hasService(SRV_POWER_SUPPLY) &&
        device.hasService(SRV_DC_CURRENT_MEASUREMENT) &&
        device.hasService(SRV_DC_VOLTAGE_MEASUREMENT) &&
        device.hasService(SRV_RELAY)
    )
}

export function filterTestDevice(device: JDDevice) {
    // module tester
    if (isModuleTester(device)) return false

    return !ignoredDevices.some(sc => device.hasService(sc))
}

export function filterTestService(serviceClass: number) {
    return ignoredServices.indexOf(serviceClass) < 0
}
