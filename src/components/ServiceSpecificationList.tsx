import { Chip, Grid, List, ListItem, ListItemText } from "@material-ui/core"
import React, { useMemo } from "react"
import {
    deviceSpecificationsForService,
    isInfrastructure,
} from "../../jacdac-ts/src/jdom/spec"
import { serviceTestFromServiceClass } from "../../jacdac-ts/src/test/testspec"
import { arrayShuffle } from "../../jacdac-ts/src/jdom/utils"
import GridHeader from "./ui/GridHeader"
import { Link } from "gatsby-theme-material-ui"
import MakeCodeIcon from "./icons/MakeCodeIcon"
import { VIRTUAL_DEVICE_NODE_NAME } from "../../jacdac-ts/src/jdom/constants"
import { hostDefinitionFromServiceClass } from "../../jacdac-ts/src/hosts/hosts"
import KindIcon from "./KindIcon"
import ChipList from "./ui/ChipList"
import JacdacIcon from "./icons/JacdacIcon"
import Markdown from "./ui/Markdown"
import CheckCircleIcon from "@material-ui/icons/CheckCircle"
import { resolveMakecodeServiceFromClassIdentifier } from "../../jacdac-ts/src/jdom/makecode"

function ServiceSpecificatinListItem(props: { service: jdspec.ServiceSpec }) {
    const { service } = props
    const { shortId, classIdentifier, name, notes, tags } = service
    const makecode = resolveMakecodeServiceFromClassIdentifier(classIdentifier)
    const simulator = hostDefinitionFromServiceClass(classIdentifier)
    const device = !!deviceSpecificationsForService(classIdentifier)?.length
    const test = serviceTestFromServiceClass(classIdentifier)

    return (
        <Link to={`/services/${shortId}`} style={{ textDecoration: "none" }}>
            <ListItemText
                key={classIdentifier}
                primary={name}
                secondary={
                    <ChipList>
                        <Markdown source={notes["short"]} />
                        {tags?.map(tag => (
                            <Chip key={tag} size="small" label={tag} />
                        ))}
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
                        {test && (
                            <Chip
                                icon={<CheckCircleIcon />}
                                size="small"
                                label="test"
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
                <List>
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
