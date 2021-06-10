import React, { useContext } from "react"
import { Button } from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import { startServiceProviderFromServiceClass } from "../../../../jacdac-ts/src/servers/servers"
import JacdacContext, { JacdacContextProps } from "../../../jacdac/Context"
import WorkspaceContext from "../WorkspaceContext"
import { serviceSpecificationFromName } from "../../../../jacdac-ts/src/jdom/spec"
import { Alert } from "@material-ui/lab"

export default function NoServiceAlert() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { roleService, roleServiceShortId, flyout } =
        useContext(WorkspaceContext)
    const spec = serviceSpecificationFromName(roleServiceShortId)
    const handleStartSimulator = () =>
        startServiceProviderFromServiceClass(bus, spec.classIdentifier)

    // nothing to do here
    if (roleService || flyout) return null

    // unresolved, unknown service
    if (!roleService && !roleServiceShortId) return null

    // unknown spec
    if (!spec) return <Alert severity="warning">Unknown service</Alert>

    return (
        <Button
            variant="outlined"
            color="default"
            startIcon={<AddIcon />}
            onClick={handleStartSimulator}
        >
            start {spec.name}
        </Button>
    )
}
