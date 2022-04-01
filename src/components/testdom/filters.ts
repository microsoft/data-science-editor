import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import {
    SRV_BOOTLOADER,
    SRV_BRIDGE,
    SRV_CONTROL,
    SRV_DASHBOARD,
    SRV_INFRASTRUCTURE,
    SRV_JACSCRIPT_CLOUD,
    SRV_JACSCRIPT_CONDITION,
    SRV_LOGGER,
    SRV_POWER_SUPPLY,
    SRV_PROTO_TEST,
    SRV_PROXY,
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
    SRV_POWER_SUPPLY,
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
    SRV_JACSCRIPT_CLOUD,
    SRV_JACSCRIPT_CONDITION,
]

export function filterTestDevice(device: JDDevice) {
    return !ignoredDevices.some(sc => device.hasService(sc))
}

export function filterTestService(serviceClass: number) {
    return ignoredServices.indexOf(serviceClass) < 0
}
