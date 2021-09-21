import React, { useContext } from "react"
import ConnectButton from "./ConnectButton"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useMediaQueries from "../hooks/useMediaQueries"
import useChange from "../../jacdac/useChange"
import DeveloperBoardIcon from "@material-ui/icons/DeveloperBoard"
import Button from "../ui/Button"
import AppContext from "../AppContext"

function DisconnectedButton(props: {
    full?: boolean
    className?: string
    transparent?: boolean
}) {
    const { mobile } = useMediaQueries()
    const { toggleShowConnectTransportDialog } = useContext(AppContext)
    const { full, transparent, className } = props
    const small = full !== true && (!full || mobile)
    const trackName = `transport.connect.start`

    if (small)
        return (
            <span>
                <IconButtonWithTooltip
                    title={"Connect to physical device"}
                    color={transparent ? "inherit" : "primary"}
                    className={className}
                    onClick={toggleShowConnectTransportDialog}
                >
                    <DeveloperBoardIcon />
                </IconButtonWithTooltip>
            </span>
        )
    else
        return (
            <Button
                trackName={trackName}
                title="Connect to a physical device"
                size="small"
                variant={transparent ? "outlined" : "contained"}
                color={transparent ? "inherit" : "primary"}
                className={className}
                startIcon={<DeveloperBoardIcon />}
                onClick={toggleShowConnectTransportDialog}
            >
                Connect
            </Button>
        )
}

export default function ConnectButtons(props: {
    full?: boolean
    className?: string
    transparent?: boolean
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { transports } = bus
    const disconnected = useChange(bus, _ => _.disconnected)

    if (!transports?.length) return null

    return disconnected ? (
        <DisconnectedButton {...props} />
    ) : (
        <>
            {transports
                .filter(tr => !tr.disconnected)
                .map(transport => (
                    <ConnectButton
                        key={transport.type}
                        transport={transport}
                        {...props}
                    />
                ))}
        </>
    )
}
