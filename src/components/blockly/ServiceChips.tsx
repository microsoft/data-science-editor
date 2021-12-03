import React, { useContext } from "react"
import ServiceChip from "./ServiceChip"
import useServices from "../hooks/useServices"
import ChipList from "../ui/ChipList"
import { Chip } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import AppContext from "../AppContext"

export default function ServiceChips() {
    const services = useServices({ sensor: true })
    const { toggleShowDeviceHostsDialog } = useContext(AppContext)

    return (
        <ChipList>
            <Chip
                label="start simulator"
                onClick={toggleShowDeviceHostsDialog}
                icon={<AddIcon />}
            />
            {services.map(services => (
                <ServiceChip key={services.id} service={services} />
            ))}
        </ChipList>
    )
}
