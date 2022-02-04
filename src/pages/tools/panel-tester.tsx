import {
    Accordion,
    AccordionSummary,
    Stack,
    AccordionDetails,
    Chip,
    Typography,
    Grid,
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
    tryParsePanelTestSpec,
    TestNode,
    TestState,
    DeviceTestSpec,
    DeviceTest,
    DEVICE_TEST_KIND,
    REGISTER_TEST_KIND,
    RegisterTest,
    EVENT_TEST_KIND,
    EventTest,
} from "../../../jacdac-ts/src/jdom/testdom"
import useBus from "../../jacdac/useBus"
import { styled } from "@mui/material/styles"
import clsx from "clsx"
import { TreeView } from "@mui/lab"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import StyledTreeItem, {
    StyledTreeViewItemProps,
} from "../../components/ui/StyledTreeItem"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import QuestionMarkIcon from "@mui/icons-material/QuestionMark"
import ErrorIcon from "@mui/icons-material/Error"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import useChange from "../../jacdac/useChange"
import AnnounceFlagsTreeItem from "../../components/devices/AnnounceFlagsTreeItem"
import {
    EventTreeItem,
    RegisterTreeItem,
} from "../../components/tools/JDomTreeViewItems"
import CopyButton from "../../components/ui/CopyButton"
import { delay } from "../../../jacdac-ts/src/jdom/utils"

const PANEL_MANIFEST_KEY = "panel-test-manifest"
const PANEL_URL_EXPORT_KEY = "panel-test-export-url"

function PanelDeviceChip(props: { device: DeviceTestSpec }) {
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
                {panel ? (
                    <ChipList>
                        {panel?.devices.map(device => (
                            <PanelDeviceChip
                                key={device.productIdentifier}
                                device={device}
                            />
                        ))}
                    </ChipList>
                ) : (
                    <Typography variant="body1">
                        Invalid configuration
                    </Typography>
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
        // decimal or hex as string
        productIdentifier: number | string
        count: number
        firmwareVersion?: string
        // optional if device in catalog
        services?: {
            name?: string
            // decimal or hex as string
            serviceClass?: number | string
            count?: number
        }[]
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
    [DEVICE_TEST_KIND]: DeviceTestTreeItemExtra,
    [REGISTER_TEST_KIND]: RegisterTestTreeItemExtra,
    [EVENT_TEST_KIND]: EventTestTreeItemExtra,
}

function TestTreeItem(props: { node: TestNode }) {
    const { node, ...rest } = props
    const { id, nodeKind, children: nodeChildren } = node
    const label = useChange(node, _ => _?.label)
    const error = useChange(node, _ => _?.error)

    const testComponent = testComponents[nodeKind]
    const testNode = testComponent ? createElement(testComponent, props) : null

    return (
        <StyledTreeItem
            nodeId={id}
            labelText={label}
            alert={error}
            icon={<TestIcon node={node} />}
            {...rest}
        >
            {testNode}
            {!!nodeChildren.length && (
                <>
                    {nodeChildren.map(child => (
                        <TestTreeItem key={child.id} node={child} {...rest} />
                    ))}
                </>
            )}
        </StyledTreeItem>
    )
}

function DeviceTestTreeItemExtra(
    props: { node: TestNode } & StyledTreeViewItemProps
) {
    const { node, ...rest } = props
    const { device } = node as DeviceTest
    if (!device) return null
    return (
        <AnnounceFlagsTreeItem device={device} showIdentify={true} {...rest} />
    )
}

function RegisterTestTreeItemExtra(
    props: { node: TestNode } & StyledTreeViewItemProps
) {
    const { node, ...rest } = props
    const { register } = node as RegisterTest
    if (!register) return null
    return <RegisterTreeItem register={register} {...rest} />
}

function EventTestTreeItemExtra(
    props: { node: TestNode } & StyledTreeViewItemProps
) {
    const { node, ...rest } = props
    const { event } = node as EventTest
    if (!event) return null
    return <EventTreeItem event={event} {...rest} />
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

function Results(props: { panel: PanelTest }) {
    const { panel } = props
    const [expanded, setExpanded] = useState(false)
    const handleExpanded = () => setExpanded(v => !v)

    const label = useChange(panel, _ => _.label)

    return (
        <Accordion expanded={expanded} onChange={handleExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Chip icon={<TestIcon node={panel} />} label={label} />
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <PanelTestTreeView panel={panel} />
            </AccordionDetails>
        </Accordion>
    )
}

function Exports(props: { panel: PanelTest }) {
    const { panel } = props

    const serialize = async () => {
        const repo = process.env.GATSBY_GITHUB_REPOSITORY
        const sha = process.env.GATSBY_GITHUB_SHA
        panel.deviceTests
            .map(d => d.device)
            .filter(d => !!d)
            .forEach(d => d.refreshFirmwareInfo())
        await delay(500)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r: any = panel.export()
        if (repo && sha) r.jacdac = { repo, sha }
        return JSON.stringify(r, null, 2)
    }

    return (
        <Grid container spacing={1}>
            <CopyButton
                variant="outlined"
                onCopy={serialize}
                label="export to clipboard"
            />
        </Grid>
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
    const [panel, setPanel] = useState<PanelTest>(undefined)
    useEffect(() => {
        bus.streaming = true
        return () => {
            bus.streaming = false
        }
    }, [bus])
    useEffect(() => {
        if (panelSpec) {
            const p = createPanelTest(bus, panelSpec)
            setPanel(p)
            return () => (p.bus = undefined)
        } else {
            setPanel(undefined)
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
            {panel && <Results panel={panel} />}
            {panel && <Exports panel={panel} />}
        </Stack>
    )
}
