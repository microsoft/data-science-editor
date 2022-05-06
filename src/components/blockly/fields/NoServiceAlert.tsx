import React, { CSSProperties, useContext } from "react"
import { Button, useTheme } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { startServiceProviderFromServiceClass } from "../../../../jacdac-ts/src/servers/servers"
import WorkspaceContext from "../WorkspaceContext"
import { serviceSpecificationFromClassIdentifier } from "../../../../jacdac-ts/src/jdom/spec"
import { Alert } from "@mui/material"
import useBus from "../../../jacdac/useBus"

export default function NoServiceAlert() {
    const bus = useBus()
    const { twinService, roleServiceClass, flyout } =
        useContext(WorkspaceContext)
    const theme = useTheme()
    const spec = serviceSpecificationFromClassIdentifier(roleServiceClass)
    const handleStartSimulator = () =>
        startServiceProviderFromServiceClass(bus, spec.classIdentifier)

    // nothing to do here
    if (twinService || flyout) return null

    // unresolved, unknown service
    if (!twinService && !roleServiceClass) return null

    // unknown spec
    if (!spec) return <Alert severity="warning">Unknown service</Alert>

    const { palette } = theme
    const style: CSSProperties = {
        color: palette.text.primary,
    }

    return (
        <Button
            variant="outlined"
            color="inherit"
            startIcon={<AddIcon />}
            onClick={handleStartSimulator}
            style={style}
        >
            start {spec.name}
        </Button>
    )
}
