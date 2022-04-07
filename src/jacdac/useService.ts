import { ANNOUNCE } from "../../jacdac-ts/src/jdom/constants"
import { useEffect, useState } from "react"
import { JDDevice } from "../../jacdac-ts/src/jdom/device"

export default function useService(device: JDDevice, serviceIndex: number) {
    const [service, setService] = useState(device?.service(serviceIndex))

    useEffect(() => {
        const unsub = device?.subscribe(ANNOUNCE, () => {
            setService(device.service(serviceIndex))
        })
        setService(device?.service(serviceIndex))
        return unsub
    }, [device, serviceIndex])

    return service
}
