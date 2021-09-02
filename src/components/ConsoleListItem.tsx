import React from "react"
import {
    ListItem,
    Typography,
    ListItemIcon,
    Theme,
    makeStyles,
    createStyles,
    Chip,
} from "@material-ui/core"
import Packet from "../../jacdac-ts/src/jdom/packet"
import { decodePacketData } from "../../jacdac-ts/src/jdom/pretty"
import clsx from "clsx"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import WarningIcon from "@material-ui/icons/Warning"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import ErrorIcon from "@material-ui/icons/Error"
import { JSONTryParse } from "../../jacdac-ts/src/jdom/utils"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        device: {
            marginRight: theme.spacing(1),
        },
        item: {
            marginBottom: 0,
            borderTop: "1px solid #ddd",
            borderBottom: "1px solid #ddd",
        },
        debug: {
            color: "gray",
        },
        log: {},
        warn: {
            background: "#ffffd5",
        },
        error: {},
    })
)

export default function ConsoleListItem(props: { packet: Packet }) {
    const { packet } = props
    const classes = useStyles()
    const decoded = decodePacketData(packet)
    const severity = decoded.info.identifier
    const decodedText = decoded?.decoded[0]
    const text = JSONTryParse(decodedText?.humanValue) || "???"

    function severityClass() {
        switch (severity) {
            case 0x80:
                return classes.debug
            case 0x82:
                return classes.warn
            case 0x83:
                return classes.error
            default:
                return classes.log
        }
    }

    return (
        <ListItem dense={true} className={clsx(classes.item, severityClass())}>
            {severity >= 0x82 && (
                <ListItemIcon>
                    {severity == 0x82 ? <WarningIcon /> : <ErrorIcon />}
                </ListItemIcon>
            )}
            <Chip
                className={classes.device}
                size="small"
                label={packet?.device?.shortId || "?"}
            />
            <Typography variant="body2">{text}</Typography>
        </ListItem>
    )
}
