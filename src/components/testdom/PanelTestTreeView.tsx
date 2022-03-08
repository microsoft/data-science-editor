import React, { createElement, useState } from "react"
import {
    PanelTest,
    TestNode,
    DeviceTest,
    DEVICE_TEST_KIND,
    RegisterTest,
    EVENT_TEST_KIND,
    EventTest,
    ServiceTest,
    REGISTER_ORACLE_KIND,
    SERVICE_TEST_KIND,
} from "../../../jacdac-ts/src/testdom/nodes"
import { styled } from "@mui/material/styles"
import clsx from "clsx"
import { TreeView } from "@mui/lab"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import StyledTreeItem, {
    StyledTreeViewItemProps,
} from "../../components/ui/StyledTreeItem"
import useChange from "../../jacdac/useChange"
import AnnounceFlagsTreeItem from "../../components/devices/AnnounceFlagsTreeItem"
import {
    EventTreeItem,
    RegisterTreeItem,
} from "../../components/tools/JDomTreeViewItems"
import DashboardServiceWidget from "../../components/dashboard/DashboardServiceWidget"
import TestIcon from "../icons/TestIcon"

const PREFIX = "TestTreeView"
const classes = {
    root: `${PREFIX}-root`,
    margins: `${PREFIX}-margins`,
}
const StyledTreeView = styled(TreeView)(({ theme }) => ({
    [`&.${classes.root}`]: {
        flexGrow: 1,
    },

    [`&.${classes.margins}`]: {
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
    },
}))

const testComponents = {
    [DEVICE_TEST_KIND]: DeviceTestTreeItemExtra,
    //[REGISTER_TEST_KIND]: RegisterTestTreeItemExtra,
    [EVENT_TEST_KIND]: EventTestTreeItemExtra,
    [SERVICE_TEST_KIND]: ServiceTestTreeItemExtra,
    [REGISTER_ORACLE_KIND]: RegisterTestTreeItemExtra,
}

interface TestNodeProps {
    node: TestNode
    showTwins?: boolean
}

function TestTreeItem(props: TestNodeProps) {
    const { node, showTwins, ...rest } = props
    const { id, nodeKind, children: nodeChildren } = node
    const label = useChange(node, _ => _?.label)
    const info = useChange(node, _ => _?.info)
    const output = useChange(node, _ => _?.output)

    const testComponent = testComponents[nodeKind]
    const testNode = testComponent ? createElement(testComponent, props) : null

    return (
        <StyledTreeItem
            nodeId={id}
            labelText={label}
            labelInfo={info}
            icon={<TestIcon node={node} />}
            {...rest}
        >
            {testNode}
            {output && (
                <StyledTreeItem nodeId={id + ":output"} labelText={output} />
            )}
            {!!nodeChildren.length && (
                <>
                    {nodeChildren.map(child => (
                        <TestTreeItem
                            key={child.id}
                            node={child}
                            showTwins={showTwins}
                            {...rest}
                        />
                    ))}
                </>
            )}
        </StyledTreeItem>
    )
}

function DeviceTestTreeItemExtra(
    props: TestNodeProps & StyledTreeViewItemProps
) {
    const { node, ...rest } = props
    const { device } = node as DeviceTest
    if (!device) return null
    return (
        <AnnounceFlagsTreeItem device={device} showIdentify={true} {...rest} />
    )
}

function ServiceTestTreeItemExtra(
    props: TestNodeProps & StyledTreeViewItemProps
) {
    const { node, showTwins } = props
    const { service } = node as ServiceTest
    if (!service || !showTwins) return null
    return <DashboardServiceWidget service={service} expanded={false} />
}

function RegisterTestTreeItemExtra(
    props: TestNodeProps & StyledTreeViewItemProps
) {
    const { node, ...rest } = props
    const { register } = node as RegisterTest
    if (!register) return null
    return <RegisterTreeItem register={register} {...rest} />
}

function EventTestTreeItemExtra(
    props: TestNodeProps & StyledTreeViewItemProps
) {
    const { node, ...rest } = props
    const { event } = node as EventTest
    if (!event) return null
    return <EventTreeItem event={event} {...rest} />
}

export default function PanelTestTreeView(props: {
    panel: PanelTest
    showTwins?: boolean
    skipPanel?: boolean
    defaultExpanded?: boolean
}) {
    const { panel, skipPanel, defaultExpanded, showTwins, ...rest } = props
    const [expanded, setExpanded] = useState<string[]>(
        defaultExpanded ? panel.descendants.map(d => d.id) : []
    )
    const [selected, setSelected] = useState<string[]>([])
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
            {skipPanel ? (
                panel.children.map(child => (
                    <TestTreeItem
                        key={child.id}
                        node={child}
                        showTwins={showTwins}
                        {...rest}
                    />
                ))
            ) : (
                <TestTreeItem node={panel} showTwins={showTwins} {...rest} />
            )}
        </StyledTreeView>
    )
}
