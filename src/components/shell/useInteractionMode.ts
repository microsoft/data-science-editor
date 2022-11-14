import { BusInteractionMode } from "../../../jacdac-ts/src/jdom/bus"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"

export default function useInteractionMode() {
    const bus = useBus()
    const interactionMode = useChange(bus, _ => _?.interactionMode)
    const { title: interactionTitle, description: interactionDescription } = {
        [BusInteractionMode.Active]: {
            title: "Active mode",
            description: "The browser is acting as a Jacdac devices (or many).",
        },
        [BusInteractionMode.Passive]: {
            title: "Passive mode",
            description: "The browser is not sending any packet to devices.",
        },
        [BusInteractionMode.Observer]: {
            title: "Observer mode",
            description: "The browser is not polling registers automatically.",
        },
    }[interactionMode]
    return { interactionMode, interactionTitle, interactionDescription }
}
