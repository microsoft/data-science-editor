import { Grid } from "@mui/material"
import React from "react"
import { SRV_JACSCRIPT_MANAGER } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import useServices from "../hooks/useServices"
import JacscriptManagerChip from "./JacscriptManagerChip"
import useJacscript from "./JacscriptContext"

export default function JacscriptManagerChipItems() {
    const { manager, setManager } = useJacscript()
    const services = useServices({ serviceClass: SRV_JACSCRIPT_MANAGER })
    const handleSetSelected = service => () => setManager(service)

    return (
        <>
            {services.map(service => (
                <Grid item key={service.id}>
                    <JacscriptManagerChip
                        service={service}
                        selected={service === manager}
                        setSelected={handleSetSelected(service)}
                    />
                </Grid>
            ))}
        </>
    )
}
