// tslint:disable-next-line: no-submodule-imports
import { Box, createStyles, makeStyles } from "@material-ui/core"
// tslint:disable-next-line: no-submodule-imports
import Alert from "../ui/Alert"
import React, { useContext } from "react"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import ConnectButton from "../buttons/ConnectButton"
import { NoSsr } from "@material-ui/core"
import useChange from "../../jacdac/useChange"

const useStyles = makeStyles(theme =>
    createStyles({
        button: {
            marginLeft: theme.spacing(2),
        },
    })
)

function NoSsrConnectAlert(props: { serviceClass?: number }) {
    const classes = useStyles()
    const { serviceClass } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { transports } = bus
    const devices = useChange(bus, b => b.devices({ serviceClass, ignoreSelf: true }))
    const spec = serviceSpecificationFromClassIdentifier(serviceClass)

    // don't show if no transport, some devices
    if (!transports.length || devices?.length) return null

    return (
        <Box displayPrint="none">
            <Alert severity="info" closeable={true}>
                {!spec && <span>Did you connect your device?</span>}
                {spec && <span>Did you connect a {spec.name} device?</span>}
                {transports.map(transport => (
                    <ConnectButton
                        key={transport.type}
                        transport={transport}
                        className={classes.button}
                        full={true}
                        transparent={true}
                    />
                ))}
            </Alert>
        </Box>
    )
}

export default function ConnectAlert(props: { serviceClass?: number }) {
    return (
        <NoSsr>
            <NoSsrConnectAlert {...props} />
        </NoSsr>
    )
}
