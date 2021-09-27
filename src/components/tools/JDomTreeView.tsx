import React, { useState } from "react"
import clsx from "clsx"
// tslint:disable-next-line: no-submodule-imports
import { makeStyles, createStyles } from "@material-ui/core/styles"
// tslint:disable-next-line: no-submodule-imports
import TreeView from "@material-ui/lab/TreeView"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ArrowRightIcon from "@material-ui/icons/ArrowRight"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import useDevices from "../hooks/useDevices"
import { DeviceTreeItem, JDomTreeViewProps } from "./JDomTreeViewItems"
import Flags from "../../../jacdac-ts/src/jdom/flags"

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        margins: {
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(0.5),
        },
    })
)

export default function JDomTreeView(props: JDomTreeViewProps) {
    const { defaultExpanded, defaultSelected, ...other } = props
    const classes = useStyles()
    const [expanded, setExpanded] = useState<string[]>(defaultExpanded || [])
    const [selected, setSelected] = useState<string[]>(defaultSelected || [])
    const devices = useDevices({ ignoreInfrastructure: !Flags.diagnostics })

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
        <TreeView
            className={clsx(classes.root, classes.margins)}
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            defaultEndIcon={<div style={{ width: 12 }} />}
            expanded={expanded}
            selected={selected}
            onNodeToggle={handleToggle}
            onNodeSelect={handleSelect}
        >
            {devices?.map(device => (
                <DeviceTreeItem
                    key={device.id}
                    device={device}
                    expanded={expanded}
                    selected={selected}
                    {...other}
                />
            ))}
        </TreeView>
    )
}
