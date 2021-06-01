import React, { useContext } from "react"
import { Button } from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import { startServiceProviderFromServiceClass } from "../../../../jacdac-ts/src/servers/servers"
import JacdacContext, { JacdacContextProps } from "../../../jacdac/Context"
import WorkspaceContext from "../WorkspaceContext"

export default function NoServiceAlert(props: { serviceClass: number }) {
    const { serviceClass } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { roleService, flyout } = useContext(WorkspaceContext)
    const handleStartSimulator = () =>
        startServiceProviderFromServiceClass(bus, serviceClass)

    if (roleService || flyout) return null

    return (
        <Button
            variant="outlined"
            color="default"
            startIcon={<AddIcon />}
            onClick={handleStartSimulator}
        >
            start simulator
        </Button>
    )
}
