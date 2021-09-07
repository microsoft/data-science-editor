import React, { useMemo } from "react"
import {
    createStyles,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    makeStyles,
    Theme,
    Typography,
} from "@material-ui/core"
import {
    deviceSpecifications,
    identifierToUrlPath,
} from "../../../jacdac-ts/src/jdom/spec"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import InfoIcon from "@material-ui/icons/Info"
import Markdown from "../ui/Markdown"
import { IconButton } from "gatsby-theme-material-ui"
import { arrayShuffle } from "../../../jacdac-ts/src/jdom/utils"
import useDeviceImage from "../devices/useDeviceImage"
import useMediaQueries from "../hooks/useMediaQueries"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-around",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
        },
        ellipsis: {
            textOverflow: "ellipsis",
        },
        icon: {
            color: "rgba(255, 255, 255, 0.54)",
        },
    })
)

export default function DeviceSpecificationList(props: {
    count?: number
    shuffle?: boolean
    company?: string
    requiredServiceClasses?: number[]
}) {
    const { count, shuffle, requiredServiceClasses, company } = props
    const classes = useStyles()
    const { mobile, medium } = useMediaQueries()
    const cols = mobile ? 1 : medium ? 3 : 4
    const specs = useMemo(() => {
        let r = deviceSpecifications().filter(
            spec => spec.status !== "deprecated"
        )
        if (company) r = r.filter(spec => spec.company === company)
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
    }, [requiredServiceClasses, shuffle, count])

    if (!specs.length)
        return (
            <Typography variant="body1">No device registered yet.</Typography>
        )

    return (
        <ImageList className={classes.root} cols={cols}>
            {specs.map(spec => {
                const imageUrl = useDeviceImage(spec)
                return (
                    <ImageListItem key={spec.id}>
                        <img src={imageUrl} alt={spec.name} loading="lazy" />
                        <ImageListItemBar
                            title={spec.name}
                            subtitle={
                                <Markdown
                                    className={classes.ellipsis}
                                    source={spec.description.split(".", 1)[0]}
                                />
                            }
                            actionIcon={
                                <>
                                    <IconButton
                                        to={`/devices/${identifierToUrlPath(
                                            spec.id
                                        )}`}
                                        aria-label={`info about ${spec.name}`}
                                        className={classes.icon}
                                    >
                                        <InfoIcon />
                                    </IconButton>
                                </>
                            }
                        />
                    </ImageListItem>
                )
            })}
        </ImageList>
    )
}
