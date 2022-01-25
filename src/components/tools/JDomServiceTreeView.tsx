import React, { useState } from "react"
import { styled } from "@mui/material/styles"
import clsx from "clsx"
// tslint:disable-next-line: no-submodule-imports
import TreeView from "@mui/lab/TreeView"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import { JDomTreeViewProps, ServiceTreeItem } from "./JDomTreeViewItems"
import { JDService } from "../../../jacdac-ts/src/jdom/service"

const PREFIX = "JDomServiceTreeView"

const classes = {
    root: `${PREFIX}-root`,
    margins: `${PREFIX}-margins`,
}

const StyledTreeView = styled(TreeView)(({ theme }) => ({
    [`&.${classes.root}`]: {
        flexGrow: 1,
        color: "#fff !important"
    },

    [`&.${classes.margins}`]: {
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
    },
}))

export default function JDomServiceTreeView(
    props: { service: JDService } & JDomTreeViewProps
) {
    const { service, defaultExpanded, defaultSelected, ...other } = props

    const [expanded, setExpanded] = useState<string[]>(defaultExpanded || [])
    const [selected, setSelected] = useState<string[]>(defaultSelected || [])
    const handleToggle = (
        event: React.ChangeEvent<unknown>,
        nodeIds: string[]
    ) => {
        setExpanded(nodeIds)
    }
    const handleSelect = (
        event: React.ChangeEvent<unknown>,
        nodeIds: string[]
    ) => {
        setSelected(nodeIds)
    }

    return (
        <StyledTreeView
            className={clsx(classes.root, classes.margins)}
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            defaultEndIcon={<div style={{ width: 12 }} />}
            expanded={expanded}
            selected={selected}
            onNodeToggle={handleToggle}
            onNodeSelect={handleSelect}
        >
            <ServiceTreeItem
                key={"node:" + service.nodeId}
                service={service}
                expanded={expanded}
                selected={selected}
                showMembersOnly={true}
                {...other}
            />
        </StyledTreeView>
    )
}
