import React from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import AddIcon from "@mui/icons-material/Add"
import { useContext } from "react"
import SimulatorDialogsContext from "../SimulatorsDialogContext"

export default function StartSimulatorButton(props: { trackName?: string }) {
    const { trackName } = props
    const { toggleShowDeviceHostsDialog } = useContext(SimulatorDialogsContext)
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
