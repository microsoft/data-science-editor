import React, { useMemo } from "react"
import { styled } from "@mui/material/styles"
import {
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Typography,
} from "@mui/material"
import {
    deviceSpecifications,
    identifierToUrlPath,
} from "../../../jacdac-ts/src/jdom/spec"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import InfoIcon from "@mui/icons-material/Info"
import { IconButton } from "gatsby-theme-material-ui"
import { arrayShuffle } from "../../../jacdac-ts/src/jdom/utils"
import useDeviceImage from "../devices/useDeviceImage"
import useMediaQueries from "../hooks/useMediaQueries"
import { escapeDeviceIdentifier } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import useDeviceSpecifications from "../devices/useDeviceSpecifications"
import { dependencyId } from "../../../jacdac-ts/src/jdom/eventsource"

const PREFIX = "DeviceSpecificationList"

const classes = {
    root: `${PREFIX}-root`,
    ellipsis: `${PREFIX}-ellipsis`,
    icon: `${PREFIX}-icon`,
}

const StyledImageList = styled(ImageList)(({ theme }) => ({
    [`&.${classes.root}`]: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
    },

    [`& .${classes.ellipsis}`]: {
        textOverflow: "ellipsis",
    },

    [`& .${classes.icon}`]: {
        color: "rgba(255, 255, 255, 0.54)",
    },
}))

export default function DeviceSpecificationList(props: {
    count?: number
    shuffle?: boolean
    company?: string
    requiredServiceClasses?: number[]
    devices?: jdspec.DeviceSpec[]
}) {
    const { count, shuffle, requiredServiceClasses, company, devices } = props

    const { mobile, medium } = useMediaQueries()
    const specifications = useDeviceSpecifications()
    const cols = mobile ? 1 : medium ? 3 : 4
    const specs = useMemo(() => {
        let r = devices || specifications
        if (company) {
            const lc = escapeDeviceIdentifier(company)
            r = r.filter(spec =>
                escapeDeviceIdentifier(spec.company).startsWith(lc)
            )
        }
        if (requiredServiceClasses)
            r = r.filter(
                spec =>
                    spec.services.length &&
                    requiredServiceClasses.every(
                        srv => spec.services.indexOf(srv) > -1
                    )
            )
        if (shuffle) arrayShuffle(r)
        if (count !== undefined) r = r.slice(0, count)
        return r
    }, [
        requiredServiceClasses,
        shuffle,
        count,
        company,
        JSON.stringify(devices?.map(d => d.id)),
        specifications,
    ])

    if (!specs.length)
        return (
            <Typography variant="body1">No device registered yet.</Typography>
        )

    return (
        <StyledImageList className={classes.root} cols={cols}>
            {specs.map(spec => {
                const imageUrl = useDeviceImage(spec, "list")
                return (
                    <ImageListItem key={spec.id}>
                        <img src={imageUrl} alt={spec.name} loading="lazy" />
                        <ImageListItemBar
                            title={`${spec.name} ${
                                spec.version ? `v${spec.version}` : ""
                            }`}
                            actionIcon={
                                <>
                                    <IconButton
                                        to={`/devices/${identifierToUrlPath(
                                            spec.id
                                        )}`}
                                        aria-label={`info about ${spec.name}`}
                                        className={classes.icon}
                                        size="large"
                                    >
                                        <InfoIcon style={{ color: "white" }} />
                                    </IconButton>
                                </>
                            }
                        />
                    </ImageListItem>
                )
            })}
        </StyledImageList>
    )
}
