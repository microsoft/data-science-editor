import useBus from "../../jacdac/useBus"

/**
 * Gets the device catalog from the current bus
 * @returns
 */
export default function useDeviceCatalog() {
    const bus = useBus()
    return bus.deviceCatalog
}
