import React, { Fragment, useContext } from "react"
import { Link } from "gatsby-theme-material-ui"
import {
    serviceSpecificationFromName,
    isRegister,
    isEvent,
    isCommand,
    isPipeReport,
    isReportOf,
    isPipeReportOf,
} from "../../jacdac-ts/src/jdom/spec"
import PacketSpecification from "../components/PacketSpecification"
import IDChip from "./IDChip"
import Markdown from "./ui/Markdown"
import EnumSpecification from "./EnumSpecification"
import { Box, Grid } from "@material-ui/core"
import ServiceSpecificationStatusAlert from "./ServiceSpecificationStatusAlert"
import useServiceProviderFromServiceClass from "./hooks/useServiceProviderFromServiceClass"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import useChange from "../jacdac/useChange"
import DashbardDeviceItem from "./dashboard/DashboardDeviceItem"

function DashboardServiceDevices(props: { serviceClass: number }) {
    const { serviceClass } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const devices = useChange(bus, b => b.devices({ serviceClass }))
    return (
        <Grid container spacing={1}>
            {devices.map(device => (
                <DashbardDeviceItem
                    key={device.id}
                    device={device}
                    showAvatar={true}
                    showHeader={true}
                />
            ))}
        </Grid>
    )
}

export default function ServiceSpecification(props: {
    service: jdspec.ServiceSpec
    showDerived?: boolean
}) {
    const { service: node, showDerived } = props
    const { shortId, name, classIdentifier } = node
    const packets = node.packets.filter(pkt => showDerived || !pkt.derived)
    const registers = packets.filter(isRegister)
    const events = packets.filter(isEvent)
    const commands = packets.filter(isCommand)
    const reports = packets.filter(r => r.secondary)
    const pipeReports = packets.filter(isPipeReport)
    const others = packets.filter(
        r =>
            registers.indexOf(r) < 0 &&
            events.indexOf(r) < 0 &&
            commands.indexOf(r) < 0 &&
            reports.indexOf(r) < 0 &&
            pipeReports.indexOf(r) < 0
    )
    // spin up provider on demand
    useServiceProviderFromServiceClass(node.classIdentifier)

    const reportOf = (pkt: jdspec.PacketInfo) =>
        reports.find(rep => isReportOf(pkt, rep))
    const pipeReportOf = (pkt: jdspec.PacketInfo) =>
        pipeReports.find(rep => isPipeReportOf(pkt, rep))

    return (
        <>
            <h1 key="title">
                {name}
                <Box ml={1} component="span">
                    <IDChip
                        id={node.classIdentifier}
                        filter={`srv:${shortId}`}
                    />
                </Box>
            </h1>
            <ServiceSpecificationStatusAlert specification={node} />
            <Markdown key="notesshort" source={node.notes.short} />
            {!!node.extends?.length && (
                <p key="extends">
                    <span>Extends </span>
                    {node.extends.map((extend, i) => (
                        <Fragment key={`extend${extend}`}>
                            {i > 0 && <span>, </span>}
                            <Link
                                key={`extend${extend}`}
                                to={`/services/${extend}/`}
                            >
                                {serviceSpecificationFromName(extend).name}
                            </Link>
                        </Fragment>
                    ))}
                    .
                </p>
            )}
            <Markdown key="noteslong" source={node.notes.long || ""} />
            <DashboardServiceDevices serviceClass={classIdentifier} />
            <EnumSpecification key="enums" serviceClass={classIdentifier} />
            {[
                {
                    name: "Registers",
                    packets: registers,
                    note: node.notes["registers"],
                },
                { name: "Events", packets: events, note: node.notes["events"] },
                {
                    name: "Commands",
                    packets: commands,
                    note: node.notes["commands"],
                },
                { name: "Others", packets: others, note: node.notes["others"] },
            ]
                .filter(group => group.packets.length)
                .map(group => (
                    <Fragment key={`group${group.name}`}>
                        <h2>{group.name}</h2>
                        {group.note && (
                            <Markdown
                                key={`node${group.name}`}
                                source={group.note}
                            />
                        )}
                        {group.packets
                            .sort(
                                (l, r) =>
                                    (l.derived ? 1 : -1) - (r.derived ? 1 : -1)
                            )
                            .map((pkt, i) => (
                                <PacketSpecification
                                    key={`pkt${pkt.name}`}
                                    serviceClass={node.classIdentifier}
                                    packetInfo={pkt}
                                    reportInfo={reportOf(pkt)}
                                    pipeReportInfo={pipeReportOf(pkt)}
                                    showDevices={true}
                                />
                            ))}
                    </Fragment>
                ))}
        </>
    )
}
