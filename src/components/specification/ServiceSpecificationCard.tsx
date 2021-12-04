import React, { useContext } from "react"
import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    Typography,
} from "@mui/material"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import IDChip from "../IDChip"
import { Button } from "gatsby-theme-material-ui"
import Markdown from "../ui/Markdown"
import ServiceSpecificationStatusAlert from "./ServiceSpecificationStatusAlert"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import KindIcon from "../KindIcon"
import { VIRTUAL_DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import { navigate } from "gatsby"
import Alert from "../ui/Alert"

export default function ServiceSpecificationCard(props: {
    serviceClass?: number
    specification?: jdspec.ServiceSpec
    showReleaseStatus?: boolean
    showServiceClass?: boolean
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { serviceClass, specification, showReleaseStatus, showServiceClass } =
        props
    let spec = specification
    if (!spec && serviceClass !== undefined)
        spec = serviceSpecificationFromClassIdentifier(serviceClass)
    const sc = spec?.classIdentifier || serviceClass
    const srv = spec?.shortId || sc?.toString(16)
    const hostDefinition = serviceProviderDefinitionFromServiceClass(sc)
    const handleSimulatorClick = () => {
        addServiceProvider(bus, hostDefinition)
        navigate("/dashboard/")
    }

    return (
        <Card>
            <CardHeader
                title={spec?.name || `0x${serviceClass?.toString(16) || "?"}`}
                subheader={
                    showServiceClass &&
                    srv && <IDChip id={sc} filter={`srv:${srv}`} />
                }
                action={
                    <>
                        {hostDefinition && (
                            <Chip
                                size="small"
                                onClick={handleSimulatorClick}
                                avatar={
                                    <KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />
                                }
                                aria-label="start simulator and open dashboard"
                                label="simulator"
                            />
                        )}
                    </>
                }
            />
            <CardContent>
                {!spec && <Alert severity="warning">Unknown service</Alert>}
                {spec?.notes["short"] && (
                    <Typography variant="body2" component="div">
                        <Markdown
                            source={spec?.notes["short"].split(".", 1)[0] + "."}
                        />
                    </Typography>
                )}
                {showReleaseStatus && (
                    <ServiceSpecificationStatusAlert specification={spec} />
                )}
            </CardContent>
            {spec && (
                <CardActions>
                    <Button
                        variant="outlined"
                        aria-label={`open service ${spec.shortId} page`}
                        to={`/services/${spec.shortId}/`}
                    >
                        More...
                    </Button>
                </CardActions>
            )}
        </Card>
    )
}
