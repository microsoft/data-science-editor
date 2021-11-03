import React, { useContext } from "react"
import JDBridge from "../../../jacdac-ts/src/jdom/bridge"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"
import IconButtonWithTooltip from "./IconButtonWithTooltip"
import DevicesOtherIcon from "@mui/icons-material/DevicesOther"

function BridgeButton(props: { bridge: JDBridge; className: string }) {
    const { bridge, className } = props
    const handleClick = () => (bridge.bus = undefined)
    return (
        <IconButtonWithTooltip
            className={className}
            color="inherit"
            title={`disconnect ${bridge.bridgeId}`}
            onClick={handleClick}
        >
            <DevicesOtherIcon />
        </IconButtonWithTooltip>
    )
}

export default function BridgeButtons(props: { className?: string }) {
    const { className } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const bridges = useChange(bus, _ => _?.bridges)

    if (!bridges?.length) return null

    return (
        <>
            {bridges.map(bridge => (
                <BridgeButton
                    key={bridge.bridgeId}
                    bridge={bridge}
                    className={className}
                />
            ))}
        </>
    )
}
