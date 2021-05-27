import { useEffect, useContext, useState } from "react"
import {
    DEVICE_ANNOUNCE,
    DEVICE_CHANGE,
} from "../../../jacdac-ts/src/jdom/constants"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

export default function useNode(nodeid: string) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [node, setNode] = useState(bus.node(nodeid))

    useEffect(
        () =>
            bus?.subscribe([DEVICE_CHANGE, DEVICE_ANNOUNCE], () => {
                const newNode = bus.node(nodeid)
                if (node !== newNode) setNode(node)
            }),
        [nodeid]
    )

    return node
}
