import { withPrefix } from "gatsby-link"
import { identifierToUrlPath } from "../../../jacdac-ts/src/jdom/spec"

export default function useDeviceImage(
    specification: jdspec.DeviceSpec,
    size: "avatar" | "lazy" | "catalog" | "preview" | "full"
) {
    const sz = size || "full"
    return (
        specification &&
        withPrefix(
            `images/devices/${identifierToUrlPath(specification.id)}.${sz}.jpg`
        )
    )
}
