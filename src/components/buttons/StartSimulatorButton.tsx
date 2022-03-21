import React from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import AddIcon from "@mui/icons-material/Add"
import { useContext } from "react"
import SimulatorDialogsContext from "../SimulatorsDialogContext"
import { Chip } from "@mui/material"

export default function StartSimulatorButton(props: {
    trackName?: string
    useChip?: boolean
}) {
    const { trackName, useChip } = props
    const { toggleShowDeviceHostsDialog } = useContext(SimulatorDialogsContext)
    const handleShowStartSimulator = () =>
        toggleShowDeviceHostsDialog({ trackName })

    if (useChip)
        return (
            <Chip
                label="simulator"
                title="start new device simulator"
                variant="outlined"
                icon={<AddIcon />}
                onClick={handleShowStartSimulator}
            />
        )
    else
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
