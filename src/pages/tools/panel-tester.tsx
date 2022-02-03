import {
    Accordion,
    AccordionSummary,
    Stack,
    AccordionDetails,
    Chip,
} from "@mui/material"
import React, { createElement, useEffect, useMemo, useState } from "react"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import HighlightTextField from "../../components/ui/HighlightTextField"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Markdown from "../../components/ui/Markdown"
import ChipList from "../../components/ui/ChipList"
import useDeviceImage from "../../components/devices/useDeviceImage"
import { useDeviceSpecificationFromProductIdentifier } from "../../jacdac/useDeviceSpecification"
import ImageAvatar from "../../components/tools/ImageAvatar"
import {
    createPanelTest,
    PanelTest,
    PanelTestSpec,
    PanelDeviceTestSpec,
    tryParsePanelTestSpec,
    TestNode,
    TestState,
    DeviceTest,
    DEVICE_TEST_KIND,
} from "../../../jacdac-ts/src/jdom/testdom"
import useBus from "../../jacdac/useBus"
import { styled } from "@mui/material/styles"
import clsx from "clsx"
import { TreeView } from "@mui/lab"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import StyledTreeItem from "../../components/ui/StyledTreeItem"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import QuestionMarkIcon from "@mui/icons-material/QuestionMark"
import ErrorIcon from "@mui/icons-material/Error"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import useChange from "../../jacdac/useChange"
import DeviceProductInformationTreeItem from "../../components/devices/DeviceInformationTreeItem"
import AnnounceFlagsTreeItem from "../../components/devices/AnnounceFlagsTreeItem"

const PANEL_MANIFEST_KEY = "panel-test-manifest"

function PanelDeviceChip(props: { device: PanelDeviceTestSpec }) {
    const { device } = props
    const { productIdentifier, count } = device
    const specification =
        useDeviceSpecificationFromProductIdentifier(productIdentifier)
    const imageUrl = useDeviceImage(specification, "avatar")
    const name = specification?.name || "?"

    return (
        <Chip
            icon={<ImageAvatar src={imageUrl} alt={name} avatar={true} />}
            label={`${name} x ${count}`}
            size="small"
        />
    )
}

function Manifest(props: {
    source?: string
    setSource: (v: string) => void
    panel: PanelTestSpec
}) {
    const { source, setSource, panel } = props
    const [expanded, setExpanded] = useState(!source)
    const handleExpanded = () => setExpanded(v => !v)

    return (
        <Accordion expanded={expanded} onChange={handleExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {panel && (
                    <ChipList>
                        {panel?.devices.map(device => (
                            <PanelDeviceChip
                                key={device.productIdentifier}
                                device={device}
                            />
                        ))}
                    </ChipList>
                )}
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <Stack spacing={1}>
                    <HighlightTextField
                        code={source}
                        language={"json"}
                        onChange={setSource}
                    />
                    <Markdown
                        source={`
#### Manifest Format                        

A JSON formatted manifest containing an array of device specification reference and their expected item count:
\`\`\`js
export interface PanelTestSpec {
    id: string
    devices: {
        productIdentifier: number
        services: number[]
        count: number
    }[]
}
\`\`\`
`}
                    />
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}

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

function TestIcon(props: { node: TestNode }) {
    const { node } = props
    const state = useChange(node, _ => _?.state)
    switch (state) {
        case TestState.Running:
            return <HourglassEmptyIcon color="action" />
        case TestState.Fail:
            return <ErrorIcon color="error" />
        case TestState.Pass:
            return <CheckCircleIcon color="success" />
        default:
            return <QuestionMarkIcon color="warning" />
    }
}

const testComponents = {
    [DEVICE_TEST_KIND]: DeviceTestTreeItem
}

function TestTreeItem(props: { node: TestNode }) {
    const { node, ...rest } = props
    const { id, nodeKind, children: nodeChildren } = node
    const { label, error } = useChange(node, _ => _ ? ({ label: _.label, error: _.error }) : {})

    const testComponent = testComponents[nodeKind]
    const testNode = testComponent && node ? createElement(testComponent, props) : null

    return (
        <StyledTreeItem
            nodeId={id}
            labelText={label}
            alert={error}
            icon={<TestIcon node={node} />}
            {...rest}
        >
            {testNode}
            {!!nodeChildren.length && <>
                {nodeChildren.map(child => (
                    <TestTreeItem key={child.id} node={child} {...rest} />
                ))}
            </>}
        </StyledTreeItem>
    )
}

function DeviceTestTreeItem(props: { node: TestNode }) {
    const { node } = props
    const { device } = (node as DeviceTest)
    return <AnnounceFlagsTreeItem device={device} showIdentify={true} />
}

function PanelTestTreeView(props: { panel: PanelTest }) {
    const { panel } = props
    const [expanded, setExpanded] = useState<string[]>([])
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
            <TestTreeItem node={panel} />
        </StyledTreeView>
    )
}

export default function PanelTester() {
    const bus = useBus()
    const [manifestSource, setManifestSource] = useLocalStorage(
        PANEL_MANIFEST_KEY,
        ""
    )
    const panelSpec = useMemo(
        () => tryParsePanelTestSpec(manifestSource),
        [manifestSource]
    )
    const [panelTest, setPanelTest] = useState<PanelTest>(undefined)
    useEffect(() => {
        if (panelSpec) {
            const p = createPanelTest(bus, panelSpec)
            setPanelTest(p)
            return () => (p.bus = undefined)
        } else {
            setPanelTest(undefined)
            return undefined
        }
    }, [panelSpec])

    return (
        <Stack spacing={3}>
            <h1>Panel Tester</h1>
            <Manifest
                source={manifestSource}
                setSource={setManifestSource}
                panel={panelSpec}
            />
            <h2>Test Explorer</h2>
            {panelTest && <PanelTestTreeView panel={panelTest} />}
        </Stack>
    )
}
