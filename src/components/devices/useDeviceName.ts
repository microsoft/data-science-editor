import JDDevice from "../../../jacdac-ts/src/jdom/device"

export default function useDeviceName(
    device: JDDevice,
    includeShortId?: boolean
) {
    const name = device.friendlyName
    let r = name
    if (includeShortId && name && name !== device.shortId)
        r += ` (${device.shortId})`
    return r
}
