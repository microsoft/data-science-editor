import { useContext } from "react"
import useChange from "../../jacdac/useChange"
import BrainManagerContext from "./BrainManagerContext"

export default function useBrainScript(scriptId: string) {
    const { brainManager } = useContext(BrainManagerContext)
    const script = useChange(brainManager, _ => _?.script(scriptId), [scriptId])
    return script
}
