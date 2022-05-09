import React, { ReactNode } from "react"
import DevicesIcon from "@mui/icons-material/Devices"
import useRoleManagerClient from "../services/useRoleManagerClient"
import useChange from "../../jacdac/useChange"
import CmdButton from "../CmdButton"
import { delay } from "../../../jacdac-ts/src/jdom/utils"

export default function StartMissingSimulatorsButton(props: {
    variant?: "contained" | "outlined"
    trackName?: string
    children?: ReactNode
    hideOnDisabled?: boolean
}) {
    const { trackName, children, variant, hideOnDisabled } = props
    const roleManager = useRoleManagerClient()
    const allRolesBound = useChange(roleManager, _ => _?.allRolesBound())
    const handleStartSimulators = async () => {
        roleManager?.startSimulators()
        await delay(1000)
    }
    const disabled = !roleManager || allRolesBound

    if (disabled && hideOnDisabled) return null

    return (
        <CmdButton
            variant={variant}
            trackName={trackName}
            title="start missing Jacdac simulators"
            onClick={handleStartSimulators}
            disabled={disabled}
            icon={<DevicesIcon />}
        >
            {children}
        </CmdButton>
    )
}
