import React from "react"
import { styled } from "@mui/material/styles"
import { ListItem, Typography, ListItemIcon, Chip } from "@mui/material"
import Packet from "../../jacdac-ts/src/jdom/packet"
import { decodePacketData } from "../../jacdac-ts/src/jdom/pretty"
import clsx from "clsx"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import WarningIcon from "@mui/icons-material/Warning"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import ErrorIcon from "@mui/icons-material/Error"
import { JSONTryParse } from "../../jacdac-ts/src/jdom/utils"

const PREFIX = "ConsoleListItem"

const classes = {
    device: `${PREFIX}-device`,
    item: `${PREFIX}-item`,
    debug: `${PREFIX}-debug`,
    log: `${PREFIX}-log`,
    warn: `${PREFIX}-warn`,
    error: `${PREFIX}-error`,
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
    [`& .${classes.device}`]: {
        marginRight: theme.spacing(1),
    },

    [`&.${classes.item}`]: {
        marginBottom: 0,
        borderTop: "1px solid #ddd",
        borderBottom: "1px solid #ddd",
    },

    [`& .${classes.debug}`]: {
        color: "gray",
    },

    [`& .${classes.log}`]: {},

    [`& .${classes.warn}`]: {
        background: "#ffffd5",
    },

    [`& .${classes.error}`]: {},
}))

export default function ConsoleListItem(props: { packet: Packet }) {
    const { packet } = props

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
        <StyledListItem
            dense={true}
            className={clsx(classes.item, severityClass())}
        >
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
        </StyledListItem>
    )
}
