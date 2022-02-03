import {
    Accordion,
    AccordionSummary,
    Stack,
    AccordionDetails,
    Chip,
} from "@mui/material"
import React, { useMemo, useState } from "react"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import HighlightTextField from "../../components/ui/HighlightTextField"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Markdown from "../../components/ui/Markdown"
import { JSONTryParse } from "../../../jacdac-ts/src/jdom/utils"
import ChipList from "../../components/ui/ChipList"
import useDeviceImage from "../../components/devices/useDeviceImage"
import { useDeviceSpecificationFromIdentifier } from "../../jacdac/useDeviceSpecification"
import ImageAvatar from "../../components/tools/ImageAvatar"
import useDevices from "../../components/hooks/useDevices"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { isInfrastructure } from "../../../jacdac-ts/src/jdom/spec"

const PANEL_MANIFEST_KEY = "panel-test-manifest"

interface PanelDeviceSpec {
    id: string
    count: number
}

interface PanelSpec {
    id?: string
    devices: PanelDeviceSpec[]
}

function tryParseManifest(source: string) {
    const json = JSONTryParse(source) as PanelSpec
    if (
        json?.id &&
        json.devices &&
        Array.isArray(json.devices) &&
        json.devices.every(d => !!d.id && d.count > 0)
    )
        return json

    return undefined
}

function PanelDeviceChip(props: { device: PanelDeviceSpec }) {
    const { device } = props
    const { id, count } = device
    const specification = useDeviceSpecificationFromIdentifier(id)
    const imageUrl = useDeviceImage(specification, "avatar")
    const name = specification?.name || "?"

    return (
        <Chip
            icon={<ImageAvatar src={imageUrl} alt={id} avatar={true} />}
            label={`${name} x ${count}`}
            size="small"
        />
    )
}

function Manifest(props: {
    source?: string
    setSource: (v: string) => void
    panel: PanelSpec
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
                            <PanelDeviceChip key={device.id} device={device} />
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
{
    // (optional) panel identifier
    id?: string
    devices: {
        // device identifier in Jacdac catalog
        id: string,
        // expected number of devices in the panel
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

function PanelDeviceVerifier(props: {
    specification: jdspec.DeviceSpec
    device: JDDevice
}) {
    const { specification, device } = props
    const { deviceId, shortId } = device
    const count = specification.services.length
    const services = device.services()
    const found = services.filter(srv => !isInfrastructure(srv.specification)).length

    return (
        <tr>
            <td>{shortId} ({deviceId})</td>
            <td>{count}</td>
            <td>{found}</td>
        </tr>
    )
}

function PanelDevicesVerifier(props: { id: string; count: number }) {
    const { id, count } = props
    const specification = useDeviceSpecificationFromIdentifier(id)
    const { productIdentifiers, name } = specification
    const devices = useDevices({
        ignoreInfrastructure: true,
        physical: true,
    }).filter(d => productIdentifiers.indexOf(d.productIdentifier) > -1)

    const found = devices.length

    return (
        <>
            <tr key={id}>
                <td>{name}</td>
                <td>{count}</td>
                <td>{found}</td>
            </tr>
            {devices?.map(device => (
                <PanelDeviceVerifier
                    key={device.id}
                    specification={specification}
                    device={device}
                />
            ))}
        </>
    )
}

function PanelVerifier(props: { panel: PanelSpec }) {
    const { panel } = props
    const { devices: deviceSpecs } = panel
    return (
        <table>
            <tr>
                <th>device id</th>
                <th>count</th>
                <th>found</th>
            </tr>
            {deviceSpecs.map(({ id, count }) => (
                <PanelDevicesVerifier key={id} id={id} count={count} />
            ))}
        </table>
    )
}

export default function PanelTester() {
    const [manifestSource, setManifestSource] = useLocalStorage(
        PANEL_MANIFEST_KEY,
        ""
    )
    const panel = useMemo(
        () => tryParseManifest(manifestSource),
        [manifestSource]
    )

    return (
        <Stack spacing={1}>
            <h1>Panel Tester</h1>
            <Manifest
                source={manifestSource}
                setSource={setManifestSource}
                panel={panel}
            />
            {panel && <PanelVerifier panel={panel} />}
        </Stack>
    )
}
