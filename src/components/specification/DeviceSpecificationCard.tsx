import React from "react"
import { Card, CardContent, Chip, Typography } from "@mui/material"
import {
    identifierToUrlPath,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { CardActionArea } from "gatsby-theme-material-ui"
import { arrayify, uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
import useDeviceImage from "../devices/useDeviceImage"
import { humanify } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import ChipList from "../ui/ChipList"

export default function DeviceSpecificationCard(props: {
    specification: jdspec.DeviceSpec
    size: "list" | "preview" | "catalog"
}) {
    const { specification, size } = props
    const {
        id,
        name,
        version,
        company,
        services,
        hardwareDesign,
        firmwareSource,
        storeLink,
        makeCodeRepo,
        tags,
    } = specification
    const makeCodeRepos = arrayify(makeCodeRepo)
    const imageUrl = useDeviceImage(specification, size)
    const names = [
        tags?.indexOf("kit") > -1 ? "kit" : undefined,
        ...uniqueMap(
            services || [],
            srv => srv + "",
            srv => srv
        ).map(sc =>
            humanify(
                serviceSpecificationFromClassIdentifier(
                    sc
                )?.shortName.toLowerCase()
            )
        ),
    ]
        .filter(s => !!s)
        .join(", ")
    return (
        <Card raised>
            <CardActionArea to={`/devices/${identifierToUrlPath(id)}`}>
                <img
                    src={imageUrl}
                    style={{ aspectRatio: "4 / 3", width: "100%" }}
                    alt={`photograph of ${specification.name}`}
                    loading="lazy"
                />
                <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                        {company}
                    </Typography>
                    <Typography
                        gutterBottom
                        variant="subtitle1"
                        component="div"
                    >
                        {name}
                        {version && (
                            <Typography
                                sx={{ ml: 1 }}
                                variant="caption"
                                component="span"
                            >
                                v{version}
                            </Typography>
                        )}
                    </Typography>
                    {names && (
                        <Typography component="div" variant="subtitle2">
                            {names}
                        </Typography>
                    )}
                    <ChipList>
                        {!storeLink && <Chip size="small" label="prototype" />}
                        {!!makeCodeRepos?.length && (
                            <Chip
                                size="small"
                                label="MakeCode"
                                title="MakeCode extension available."
                            />
                        )}
                        {firmwareSource && (
                            <Chip
                                size="small"
                                label="firmware code"
                                title="Firmware source is avaiable."
                            />
                        )}
                        {hardwareDesign && (
                            <Chip
                                size="small"
                                label="hardware design"
                                title="Hardware design files available."
                            />
                        )}
                    </ChipList>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}
