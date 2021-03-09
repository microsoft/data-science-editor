import React from "react"
import { Card, CardActions, CardContent, CardHeader, CardMedia, createStyles, Grid, makeStyles, Theme } from "@material-ui/core";
import { deviceSpecificationFromFirmwareIdentifier, deviceSpecificationFromIdentifier, identifierToUrlPath, serviceSpecificationFromClassIdentifier } from "../../jacdac-ts/src/jdom/spec";
import GitHubButton from "./GitHubButton"
import IDChip from "./IDChip";
import { Button, IconButton } from "gatsby-theme-material-ui";
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import HomeIcon from '@material-ui/icons/Home';
import CardMediaWithSkeleton from "./CardMediaWithSkeleton"

export default function DeviceSpecificationCard(props: {
    deviceIdentifier?: number,
    specificationIdentifier?: string,
    specification?: jdspec.DeviceSpec
}) {
    const { deviceIdentifier, specificationIdentifier, specification } = props;
    let spec: jdspec.DeviceSpec = specification;
    if (!spec && deviceIdentifier !== undefined)
        spec = deviceSpecificationFromFirmwareIdentifier(deviceIdentifier)
    if (!spec && specificationIdentifier !== undefined)
        spec = deviceSpecificationFromIdentifier(specificationIdentifier)
    const imageUrl = useDeviceImage(spec)

    return <Card>
        <CardMediaWithSkeleton
            image={imageUrl}
            title={spec?.name}
        />
        <CardHeader
            title={spec?.name || "???"}
            subheader={<>{spec?.firmwares.map(fw => <IDChip key={fw} id={fw} />)}</>}
        />
        {spec && <CardContent>
            {spec.services.map(service => serviceSpecificationFromClassIdentifier(service)).filter(sp => !!sp)
                .map(sspec => <Button aria-label={`open service ${sspec.shortId} page`} key={sspec.shortId} to={`/services/${sspec.shortId}/`}>{sspec.name}</Button>)}
        </CardContent>}
        {spec && <CardActions>
            <Button aria-label={`open device ${spec.name} page`} to={`/devices/${identifierToUrlPath(spec.id)}`}>More...</Button>
            <IconButton to={spec.link} size="small">
                <HomeIcon />
            </IconButton>
            <GitHubButton repo={spec.repo} />
        </CardActions>}
    </Card>
}