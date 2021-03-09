import React, { useContext } from "react"
import { Card, CardActions, CardContent, CardHeader, CardMedia, Chip, createStyles, Grid, makeStyles, Theme, Typography } from "@material-ui/core";
import { serviceSpecificationFromClassIdentifier } from "../../jacdac-ts/src/jdom/spec";
import IDChip from "./IDChip";
import { Button } from "gatsby-theme-material-ui";
import Markdown from "./ui/Markdown"
import ServiceSpecificationStatusAlert from "./ServiceSpecificationStatusAlert"
import { addHost, hostDefinitionFromServiceClass } from "../../jacdac-ts/src/hosts/hosts";
import JacdacContext, { JacdacContextProps } from "../jacdac/Context";
import KindIcon from "./KindIcon";
import { VIRTUAL_DEVICE_NODE_NAME } from "../../jacdac-ts/src/jdom/constants";
import { navigate } from "gatsby"

export default function ServiceSpecificationCard(props: {
    serviceClass?: number,
    specification?: jdspec.ServiceSpec,
    showReleaseStatus?: boolean,
    showServiceClass?: boolean
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { serviceClass, specification, showReleaseStatus, showServiceClass } = props;
    let spec = specification;
    if (!spec && serviceClass !== undefined)
        spec = serviceSpecificationFromClassIdentifier(serviceClass)
    const sc = spec?.classIdentifier || serviceClass;
    const srv = spec?.shortId || sc?.toString(16);
    const hostDefinition = hostDefinitionFromServiceClass(sc)
    const handleSimulatorClick = () => {
        addHost(bus, hostDefinition.services(), hostDefinition.name)
        navigate("/dashboard/")
    }

    return <Card>
        <CardHeader
            title={spec?.name || "???"}
            subheader={showServiceClass && srv && <IDChip id={sc} filter={`srv:${srv}`} />}
            action={<>
                {hostDefinition && <Chip size="small"
                    onClick={handleSimulatorClick}
                    avatar={<KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />}
                    aria-label="start simulator and open dashboard"
                    label="simulator" />}
            </>
            }
        />
        <CardContent>
            {spec?.notes["short"] &&
                <Typography variant="body2" component="div">
                    <Markdown source={spec?.notes["short"].split(".", 1)[0] + "."} />
                </Typography>
            }
            {showReleaseStatus && <ServiceSpecificationStatusAlert specification={spec} />}
        </CardContent>
        {spec && <CardActions>
            <Button variant="outlined" aria-label={`open service ${spec.shortId} page`} to={`/services/${spec.shortId}/`}>More...</Button>
        </CardActions>}
    </Card>
}