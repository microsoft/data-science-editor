import { Chip, Grid } from "@mui/material"
import React from "react"
import { SRV_DEVICE_SCRIPT_MANAGER } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import useServices from "../hooks/useServices"
import DeviceScriptManagerChip from "./DeviceScriptManagerChip"
import useDeviceScript from "./DeviceScriptContext"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import { prettySize } from "../../../jacdac-ts/src/jdom/pretty"
import PendingIcon from "@mui/icons-material/Pending"

function CopyBytecodeButton() {
    const { bytecode, compilePending } = useDeviceScript()
    const handleCopy = async () => {
        if (!bytecode) return
        const c = toHex(bytecode)
        await navigator.clipboard.writeText(c)
    }
    const label = compilePending
        ? "......"
        : bytecode
        ? prettySize(bytecode.length)
        : "errors"
    return (
        <Chip
            icon={
                compilePending ? (
                    <PendingIcon />
                ) : bytecode ? (
                    <CheckIcon />
                ) : (
                    <CloseIcon />
                )
            }
            onClick={handleCopy}
            label={label}
            disabled={compilePending}
            title="copy bytecode to clipboard"
        />
    )
}

export default function DeviceScriptManagerChipItems() {
    const { manager, setManager } = useDeviceScript()
    const services = useServices({ serviceClass: SRV_DEVICE_SCRIPT_MANAGER })
    const handleSetSelected = service => () => setManager(service)

    return (
        <>
            {services.map(service => (
                <Grid item key={service.id}>
                    <DeviceScriptManagerChip
                        service={service}
                        selected={service === manager}
                        setSelected={handleSetSelected(service)}
                    />
                </Grid>
            ))}
        </>
    )
}
