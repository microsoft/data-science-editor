import {
    Accordion,
    AccordionSummary,
    Stack,
    AccordionDetails,
    Typography,
    Button,
} from "@mui/material"
import React, { useState } from "react"
import HighlightTextField from "../../components/ui/HighlightTextField"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Markdown from "../../components/ui/Markdown"
import ChipList from "../../components/ui/ChipList"
import {
    PanelTestSpec,
    DeviceTestSpec,
    ServiceTestSpec,
} from "../../../jacdac-ts/src/testdom/spec"
import useBus from "../../jacdac/useBus"
import {
    filterTestDevice,
    filterTestService,
} from "../../components/testdom/filters"
import { uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
import PanelDeviceChip from "../../components/testdom/PanelDeviceChip"

export default function PanelSpecEditor(props: {
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
                    services: uniqueMap(
                        services,
                        srv => srv.serviceClass.toString(16),
                        srv => srv
                    ).map(
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
                        language="json"
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
