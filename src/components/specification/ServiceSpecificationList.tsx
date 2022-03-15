import {
    Chip,
    Grid,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material"
import React, { useMemo } from "react"
import { isInfrastructure } from "../../../jacdac-ts/src/jdom/spec"
import {
    arrayShuffle,
    ellipseFirstSentence,
} from "../../../jacdac-ts/src/jdom/utils"
import GridHeader from "../ui/GridHeader"
import { Link } from "gatsby-theme-material-ui"
import MakeCodeIcon from "../icons/MakeCodeIcon"
import {
    SERVICE_MIXIN_NODE_NAME,
    VIRTUAL_DEVICE_NODE_NAME,
} from "../../../jacdac-ts/src/jdom/constants"
import { serviceProviderDefinitionFromServiceClass } from "../../../jacdac-ts/src/servers/servers"
import KindIcon from "../KindIcon"
import ChipList from "../ui/ChipList"
import JacdacIcon from "../icons/JacdacIcon"
import { resolveMakecodeServiceFromClassIdentifier } from "../makecode/services"
import { isMixinService } from "../../../jacdac-ts/jacdac-spec/spectool/jdutils"
import useDeviceCatalog from "../devices/useDeviceCatalog"
import useChange from "../../jacdac/useChange"

function ServiceSpecificatinListItem(props: { service: jdspec.ServiceSpec }) {
    const { service } = props
    const { shortId, classIdentifier, name, notes, tags } = service
    const makecode = resolveMakecodeServiceFromClassIdentifier(classIdentifier)
    const simulator = serviceProviderDefinitionFromServiceClass(classIdentifier)
    const deviceCatalog = useDeviceCatalog()
    const deviceSpecifications = useChange(deviceCatalog, _ =>
        _.specificationsForService(classIdentifier)
    )
    const device = !!deviceSpecifications?.length
    const mixin = isMixinService(classIdentifier)

    return (
        <Link to={`/services/${shortId}`} style={{ textDecoration: "none" }}>
            <ListItemText
                key={classIdentifier}
                disableTypography={true}
                primary={name}
                secondary={
                    <ChipList>
                        <Typography variant="caption">
                            {ellipseFirstSentence(notes["short"])}
                        </Typography>
                        {tags?.map(tag => (
                            <Chip key={tag} size="small" label={tag} />
                        ))}
                        {mixin && (
                            <Chip
                                icon={
                                    <KindIcon kind={SERVICE_MIXIN_NODE_NAME} />
                                }
                                size="small"
                                label="mixin"
                            />
                        )}
                        {simulator && (
                            <Chip
                                icon={
                                    <KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />
                                }
                                size="small"
                                label="simulator"
                            />
                        )}
                        {device && (
                            <Chip
                                icon={<JacdacIcon />}
                                size="small"
                                label="devices"
                            />
                        )}
                        {makecode && (
                            <Chip
                                icon={<MakeCodeIcon />}
                                size="small"
                                label="MakeCode"
                            />
                        )}
                    </ChipList>
                }
            />
        </Link>
    )
}

export default function ServiceSpecificationList(props: {
    services: jdspec.ServiceSpec[]
    title?: string
    count?: number
    shuffle?: boolean
    infrastructure?: boolean
    status?: jdspec.StabilityStatus[]
}) {
    const { services, title, count, shuffle, status, infrastructure } = props
    const specs = useMemo(() => {
        let r = services
        if (status !== undefined)
            r = r.filter(spec => status.indexOf(spec.status) > -1)
        if (infrastructure !== undefined)
            r = r.filter(spec => isInfrastructure(spec) == infrastructure)
        if (shuffle) arrayShuffle(r)
        else r.sort((l, r) => l.name.localeCompare(r.name))
        if (count !== undefined) r = r.slice(0, count)
        return r
    }, [services, count, shuffle, status, infrastructure])

    if (!specs?.length) return null

    return (
        <Grid container spacing={1}>
            {title && <GridHeader title={title} count={specs.length} />}
            <Grid item>
                <List component="div">
                    {specs.map(node => (
                        <ListItem button key={node.shortId}>
                            <ServiceSpecificatinListItem service={node} />
                        </ListItem>
                    ))}
                </List>
            </Grid>
        </Grid>
    )
}
