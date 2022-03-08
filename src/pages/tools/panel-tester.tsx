import {
    Accordion,
    AccordionSummary,
    Stack,
    AccordionDetails,
    Chip,
    Typography,
    Button,
} from "@mui/material"
import React, { useMemo, useState } from "react"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import HighlightTextField from "../../components/ui/HighlightTextField"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Markdown from "../../components/ui/Markdown"
import ChipList from "../../components/ui/ChipList"
import useDeviceImage from "../../components/devices/useDeviceImage"
import { useDeviceSpecificationFromProductIdentifier } from "../../jacdac/useDeviceSpecification"
import ImageAvatar from "../../components/tools/ImageAvatar"
import { PanelTest } from "../../../jacdac-ts/src/testdom/nodes"
import {
    PanelTestSpec,
    DeviceTestSpec,
    ServiceTestSpec,
} from "../../../jacdac-ts/src/testdom/spec"
import { tryParsePanelTestSpec } from "../../../jacdac-ts/src/testdom/compiler"
import usePanelTest from "../../components/testdom/usePanelTest"
import TestIcon from "../../components/icons/TestIcon"
import PanelTestTreeView from "../../components/testdom/PanelTestTreeView"
import PanelTestExport from "../../components/testdom/PanelTestExport"
import FirmwareLoader from "../../components/firmware/FirmwareLoader"
import useBus from "../../jacdac/useBus"
import {
    filterTestDevice,
    filterTestService,
} from "../../components/testdom/filters"

const PANEL_MANIFEST_KEY = "panel-test-manifest"

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
    const bus = useBus()

    const handleCapture = async () => {
        const devices = bus
            .devices({
                physical: true,
                announced: true,
                ignoreInfrastructure: true,
            })
            .filter(filterTestDevice)
        const dids: Record<number, DeviceTestSpec> = {}
        for (const device of devices) {
            const pid = await device.resolveProductIdentifier()
            if (!pid) continue
            const services = device
                .services()
                .filter(srv => filterTestService(srv.serviceClass))
            if (!services.length) continue
            const did =
                dids[pid] ||
                (dids[pid] = {
                    productIdentifier: pid,
                    services: services.map(
                        srv =>
                            ({
                                name: srv.specification?.shortId,
                                serviceClass: srv.serviceClass,
                                count: 0,
                            } as ServiceTestSpec)
                    ),
                    count: 0,
                })
            did.count++
            for (const service of services)
                did.services.find(
                    srv => srv.serviceClass === service.serviceClass
                ).count++

            const panel: PanelTestSpec = {
                id: "",
                devices: Object.values(dids),
                oracles: [],
            }
            setSource(JSON.stringify(panel, null, 2))
        }
    }

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
                    <h2>
                        Configuration
                        <Button
                            title="Generate manifest for current connected devices"
                            variant="outlined"
                            onClick={handleCapture}
                        >
                            Capture current
                        </Button>
                    </h2>
                    <HighlightTextField
                        code={source}
                        language={"json"}
                        onChange={setSource}
                    />
                    <Markdown
                        source={`
#### Manifest Format                        

A JSON formatted manifest containing an array of device specification reference and their expected item count:
\`\`\`typescript
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
    oracles?: {
        serviceClass: number | string
        deviceId: string
        tolerance?: number
    }[]
}
\`\`\`

For example, a panel with 20 modules with a humidity and temperature services, using an additional device \`38ce43597a4f9e69\`
as oracle would be defined as
\`\`\`json
{
    "id": "example",
    "devices": [{
        "productIdentifier": "0x3156cfd7",
        "count": 20,
        "services": [{
            "name": "humidity"
        }, {
            "name": "temperature"
        }]
    }],
    "oracles": [{
        "serviceClass": "humidity",
        "deviceId": "38ce43597a4f9e69",
        "tolerance": 1
    }, {
        "serviceClass": "temperature",
        "deviceId": "38ce43597a4f9e69",
        "tolerance": 1
    }]
}
\`\`\`
`}
                    />
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}

function Results(props: { panel: PanelTest }) {
    const { panel } = props
    const [expanded, setExpanded] = useState(true)
    const handleExpanded = () => setExpanded(v => !v)

    return (
        <Accordion expanded={expanded} onChange={handleExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h2>
                    Test Result: <TestIcon node={panel} />
                </h2>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <PanelTestTreeView panel={panel} showTwins={true} defaultExpanded={true} />
            </AccordionDetails>
        </Accordion>
    )
}

export default function PanelTester() {
    const [manifestSource, setManifestSource] = useLocalStorage(
        PANEL_MANIFEST_KEY,
        ""
    )
    const panelSpec = useMemo(
        () => tryParsePanelTestSpec(manifestSource),
        [manifestSource]
    )
    const panel = usePanelTest(panelSpec)

    return (
        <Stack spacing={3}>
            <FirmwareLoader />
            <h1>Panel Tester</h1>
            <Manifest
                source={manifestSource}
                setSource={setManifestSource}
                panel={panelSpec}
            />
            {panel && <Results panel={panel} />}
            {panel && <PanelTestExport panel={panel} />}
        </Stack>
    )
}
