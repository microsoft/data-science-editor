// tslint:disable-next-line: no-submodule-imports
import { Box } from "@material-ui/core"
// tslint:disable-next-line: no-submodule-imports
import Alert from "../ui/Alert"
import React, { useContext } from "react"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { NoSsr } from "@material-ui/core"
import ConnectButtons from "../buttons/ConnectButtons"
import useDevices from "../hooks/useDevices"

function NoSsrConnectAlert(props: {
    serviceClass?: number
    closeable?: boolean
}) {
    const { serviceClass, closeable } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { transports } = bus
    const devices = useDevices({ serviceClass, ignoreInfrastructure: true })
    const spec = serviceSpecificationFromClassIdentifier(serviceClass)

    // don't show if no transport, some devices
    if (!transports.length || devices?.length) return null

    return (
        <Box displayPrint="none">
            <Alert severity="info" closeable={closeable}>
                {!spec && <span>Did you connect your device?</span>}
                {spec && <span>Did you connect a {spec.name} device?</span>}
                <Box component="span" ml={2}>
                    <ConnectButtons full="always" transparent={true} />
                </Box>
            </Alert>
        </Box>
    )
}

export default function ConnectAlert(props: {
    serviceClass?: number
    closeable?: boolean
}) {
    return (
        <NoSsr>
            <NoSsrConnectAlert {...props} />
        </NoSsr>
    )
}
