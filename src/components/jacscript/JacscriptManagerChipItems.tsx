import { Grid } from "@mui/material"
import React from "react"
import { SRV_JACSCRIPT_MANAGER } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import useServices from "../hooks/useServices"
import JacscriptManagerChip from "./JacscriptManagerChip"
import useJacscript from "./JacscriptContext"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import CopyButton from "../ui/CopyButton"

function CopyCompiledJacscriptButton() {
    const { compiled } = useJacscript()
    const success = !!compiled?.success
    const handleCopy = async () => toHex(compiled?.binary)
    return (
        <CopyButton
            title="copy bytecode"
            disabled={!success}
            onCopy={handleCopy}
        />
    )
}

export default function JacscriptManagerChipItems() {
    const { manager, setManager } = useJacscript()
    const services = useServices({ serviceClass: SRV_JACSCRIPT_MANAGER })
    const handleSetSelected = service => () => setManager(service)

    return (
        <>
            <Grid item>
                <CopyCompiledJacscriptButton />
            </Grid>
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
