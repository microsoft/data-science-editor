import React from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import AddIcon from "@mui/icons-material/Add"
import { useContext } from "react"
import AppContext from "../AppContext"

export default function VMStartSimulatorButton() {
    const { toggleShowDeviceHostsDialog } = useContext(AppContext)
    const handleShowStartSimulator = () => toggleShowDeviceHostsDialog()
    return (
        <IconButtonWithTooltip
            title="start simulator"
            onClick={handleShowStartSimulator}
        >
            <AddIcon />
        </IconButtonWithTooltip>
    )
}
