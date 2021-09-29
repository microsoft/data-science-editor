import { withPrefix } from "gatsby-link"
import { identifierToUrlPath } from "../../../jacdac-ts/src/jdom/spec"

export default function useDeviceImage(
    specification: jdspec.DeviceSpec,
    suffix?: "avatar" | "lazy" | "catalog"
) {
    return (
        specification &&
        withPrefix(
            `images/devices/${identifierToUrlPath(specification.id)}${
                suffix ? `.${suffix}` : ""
            }.jpg`
        )
    )
}
