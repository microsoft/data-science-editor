import { useContext } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import BrainManagerContext from "./BrainManagerContext"

export default function useBrainDevice(device: JDDevice) {
    const id = device?.id
    const { brainManager } = useContext(BrainManagerContext)
    const brainDevice = useChange(brainManager, _ => _?.device(id), [device])
    return brainDevice
}
