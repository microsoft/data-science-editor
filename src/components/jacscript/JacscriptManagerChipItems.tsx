import { Chip, Grid } from "@mui/material"
import React from "react"
import { SRV_JACSCRIPT_MANAGER } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import useServices from "../hooks/useServices"
import JacscriptManagerChip from "./JacscriptManagerChip"
import useJacscript from "./JacscriptContext"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import { prettySize } from "../../../jacdac-ts/src/jdom/pretty"

function CopyCompiledJacscriptButton() {
    const { compiled, compilePending } = useJacscript()
    const { success, binary } = compiled || {}
    const handleCopy = async () => {
        if (!binary) return
        const c = toHex(binary)
        await navigator.clipboard.writeText(c)
    }
    const label = success ? prettySize(binary.length) : "errors"
    return (
        <Chip
            icon={success ? <CheckIcon /> : <CloseIcon />}
            onClick={handleCopy}
            label={label}
            disabled={compilePending}
            title="copy bytecode to clipboard"
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
