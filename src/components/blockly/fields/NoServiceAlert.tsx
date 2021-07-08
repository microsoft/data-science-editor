import React, { useContext } from "react"
import { Button } from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import { startServiceProviderFromServiceClass } from "../../../../jacdac-ts/src/servers/servers"
import JacdacContext, { JacdacContextProps } from "../../../jacdac/Context"
import WorkspaceContext from "../WorkspaceContext"
import { serviceSpecificationFromClassIdentifier } from "../../../../jacdac-ts/src/jdom/spec"
import { Alert } from "@material-ui/lab"

export default function NoServiceAlert() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { roleService, roleServiceClass, flyout } =
        useContext(WorkspaceContext)
    const spec = serviceSpecificationFromClassIdentifier(roleServiceClass)
    const handleStartSimulator = () =>
        startServiceProviderFromServiceClass(bus, spec.classIdentifier)

    // nothing to do here
    if (roleService || flyout) return null

    // unresolved, unknown service
    if (!roleService && !roleServiceClass) return null

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
