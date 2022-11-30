import { useEffect } from "react"
import useDeviceScript from "./DeviceScriptContext"

export default function useDeviceScriptVm() {
    const { acquireVm } = useDeviceScript()
    useEffect(() => acquireVm(), [])
}
