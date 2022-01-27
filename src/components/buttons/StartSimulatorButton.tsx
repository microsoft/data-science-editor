import React from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import AddIcon from "@mui/icons-material/Add"
import { useContext } from "react"
import AppContext from "../AppContext"

export default function StartSimulatorButton(props: { trackName?: string }) {
    const { trackName } = props
    const { toggleShowDeviceHostsDialog } = useContext(AppContext)
    const handleShowStartSimulator = () => toggleShowDeviceHostsDialog()
    return (
        <IconButtonWithTooltip
            title="start simulator"
            trackName={trackName}
            onClick={handleShowStartSimulator}
        >
            <AddIcon />
        </IconButtonWithTooltip>
    )
}
