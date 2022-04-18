import React, { ReactNode } from "react"
import { styled } from "@mui/material/styles"
import TreeItem, { TreeItemProps } from "@mui/lab/TreeItem"
import Typography from "@mui/material/Typography"
import KindIcon from "../KindIcon"
import WarningIcon from "@mui/icons-material/Warning"

import { useId } from "react"
import { Link } from "gatsby-material-ui-components"
import { Tooltip } from "@mui/material"
import { ellipse } from "../../../jacdac-ts/src/jdom/utils"

const PREFIX = "StyledTreeView"

const classes = {
    root: `${PREFIX}-root`,
    content: `${PREFIX}-content`,
    group: `${PREFIX}-group`,
    expanded: `${PREFIX}-expanded`,
    selected: `${PREFIX}-selected`,
    label: `${PREFIX}-label`,
    labelRoot: `${PREFIX}-labelRoot`,
    labelIcon: `${PREFIX}-labelIcon`,
    labelText: `${PREFIX}-labelText`,
}

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.root}`]: {
        color: theme.palette.text.secondary,
        "&:hover > $content": {
            backgroundColor: theme.palette.action.hover,
        },
        "&:focus > $content, &$selected > $content": {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey})`,
            color: "var(--tree-view-color)",
        },
        "&:focus > $content $label, &:hover > $content $label, &$selected > $content $label":
            {
                backgroundColor: "transparent",
            },
    },

    [`& .${classes.content}`]: {
        color: theme.palette.text.secondary,
        fontWeight: theme.typography.fontWeightMedium,
        "$expanded > &": {
            fontWeight: theme.typography.fontWeightRegular,
        },
    },

    [`& .${classes.group}`]: {
        marginLeft: 0,
        "& $content": {
            paddingLeft: theme.spacing(1),
        },
    },

    [`& .${classes.expanded}`]: {},

    [`& .${classes.selected}`]: {
        fontWeight: theme.typography.fontWeightBold,
    },

    [`& .${classes.label}`]: {
        fontWeight: "inherit",
        color: "inherit",
    },

    [`&.${classes.labelRoot}`]: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(0.5, 0),
    },

    [`& .${classes.labelIcon}`]: {
        marginRight: theme.spacing(0.5),
    },

    [`& .${classes.labelText}`]: {
        fontWeight: "inherit",
        flexGrow: 1,
        marginRight: theme.spacing(0.5),
    },
}))

declare module "csstype" {
    interface Properties {
        "--tree-view-color"?: string
        "--tree-view-bg-color"?: string
    }
}

export interface StyledTreeViewItemProps {
    key: string
    expanded: string[]
    selected: string[]
}

export interface StyledTreeViewProps {
    defaultExpanded?: string[]
    defaultSelected?: string[]
    onToggle?: (expanded: string[]) => void
    onSelect?: (selected: string[]) => void
}

export default function StyledTreeItem(
    props: TreeItemProps & {
        nodeId: string
        bgColor?: string
        color?: string
        kind?: string
        icon?: JSX.Element
        warning?: boolean
        alert?: string
        labelInfo?: string
        labelText?: string
        labelTo?: string
        actions?: JSX.Element | JSX.Element[]
        children?: ReactNode
    }
) {
    const {
        labelText,
        labelTo,
        kind,
        icon,
        labelInfo,
        color,
        bgColor,
        actions,
        nodeId,
        warning,
        alert,
        ...other
    } = props
    const domId = useId()

    return (
        <TreeItem
            id={domId}
            tabIndex={0}
            nodeId={nodeId}
            label={
                <Root className={classes.labelRoot}>
                    {kind && !icon && (
                        <KindIcon kind={kind} className={classes.labelIcon} />
                    )}
                    {icon}
                    {warning && (
                        <WarningIcon
                            color="error"
                            className={classes.labelIcon}
                        />
                    )}
                    {labelText && (
                        <Typography
                            component="span"
                            variant="body2"
                            className={classes.labelText}
                        >
                            {labelTo ? (
                                <Link
                                    color="textPrimary"
                                    to={labelTo}
                                    underline="hover"
                                >
                                    {labelText}
                                </Link>
                            ) : (
                                labelText
                            )}
                        </Typography>
                    )}
                    {alert && "!"}
                    <Typography
                        component="span"
                        variant="caption"
                        color="inherit"
                    >
                        {alert && (
                            <Typography variant="caption" component="span">
                                {alert},
                            </Typography>
                        )}
                        {labelInfo?.length > 18 ? (
                            <Tooltip title={labelInfo}>
                                <span>{ellipse(labelInfo, 18)}</span>
                            </Tooltip>
                        ) : (
                            labelInfo
                        )}
                        {actions}
                    </Typography>
                </Root>
            }
            style={{
                "--tree-view-color": color,
                "--tree-view-bg-color": bgColor,
            }}
            classes={{
                root: classes.root,
                content: classes.content,
                expanded: classes.expanded,
                selected: classes.selected,
                group: classes.group,
                label: classes.label,
            }}
            {...other}
        />
    )
}
