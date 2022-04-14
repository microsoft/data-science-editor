import React from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import DevicesIcon from "@mui/icons-material/Devices"
import useRoleManagerClient from "../services/useRoleManagerClient"
import useChange from "../../jacdac/useChange"

export default function StartMissingSimulatorsButton(props: {
    trackName?: string
}) {
    const { trackName } = props
    const roleManager = useRoleManagerClient()
    const allRolesBound = useChange(roleManager, _ => _?.allRolesBound())
    const handleStartSimulators = () => roleManager?.startSimulators()
    const disabled = !roleManager || allRolesBound

    return (
        <IconButtonWithTooltip
            trackName={trackName}
            title="start missing simulators"
            onClick={handleStartSimulators}
            disabled={disabled}
        >
            <DevicesIcon />
        </IconButtonWithTooltip>
    )
}
