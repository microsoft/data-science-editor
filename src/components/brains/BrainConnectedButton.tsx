import React from "react"
import useChange from "../../jacdac/useChange"
import ServiceConnectedIconButton from "../buttons/ServiceConnectedIconButton"
import { BrainDevice } from "./braindom"

export default function BrainConnectedButton(props: { brain: BrainDevice }) {
    const { brain } = props
    const connected = useChange(brain, _ => _.connected)
    const handleConnectionClick = ev => {
        ev.stopPropagation()
        ev.preventDefault()
    }
    return (
        <ServiceConnectedIconButton
            connected={connected}
            onClick={handleConnectionClick}
        />
    )
}
