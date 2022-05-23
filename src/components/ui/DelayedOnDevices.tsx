import React, { ReactNode, useEffect, useState } from "react"
import { inIFrame } from "../../../jacdac-ts/src/jdom/iframeclient"
import useDevices from "../hooks/useDevices"

export default function DelayedOnDevices(props: {
    timeout: number
    children: ReactNode
}) {
    const { timeout, children } = props
    const [show, setShow] = useState(false)
    const devices = useDevices({ physical: true, announced: true })
    const hasDevices = !!devices?.length
    useEffect(() => {
        if (hasDevices && !inIFrame()) {
            const id = setTimeout(() => setShow(true), timeout)
            return () => clearTimeout(id)
        }
    }, [timeout, hasDevices])
    return show ? <>{children}</> : null
}
