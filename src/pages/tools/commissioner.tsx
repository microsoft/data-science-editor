import React, { useState, useContext, useEffect, useCallback } from "react"
// tslint:disable-next-line: no-submodule-imports
import { Grid, Button } from "@material-ui/core"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
// tslint:disable-next-line: no-submodule-imports match-default-export-name
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SaveIcon from "@material-ui/icons/Save"
import CheckCircle from "@material-ui/icons/CheckCircle"
// tslint:disable-next-line: no-submodule-imports
import useDevices from "../../components/hooks/useDevices"
import {
    PACKET_RECEIVE,
    SRV_CONTROL,
    SRV_ROLE_MANAGER,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { Packet } from "../../../jacdac-ts/src/jdom/packet"
// tslint:disable-next-line: no-submodule-imports
import Table from "@material-ui/core/Table"
// tslint:disable-next-line: no-submodule-imports
import TableBody from "@material-ui/core/TableBody"
// tslint:disable-next-line: no-submodule-imports
import TableCell from "@material-ui/core/TableCell"
// tslint:disable-next-line: no-submodule-imports
import TableContainer from "@material-ui/core/TableContainer"
// tslint:disable-next-line: no-submodule-imports
import TableHead from "@material-ui/core/TableHead"
// tslint:disable-next-line: no-submodule-imports
import TableRow from "@material-ui/core/TableRow"
// tslint:disable-next-line: no-submodule-imports
import Paper from "@material-ui/core/Paper"
import GridHeader from "../../components/ui/GridHeader"
import Dashboard from "../../components/dashboard/Dashboard"
import ServiceManagerContext from "../../components/ServiceManagerContext"
import useEffectAsync from "../../components/useEffectAsync"
import { dependencyId } from "../../../jacdac-ts/src/jdom/eventsource"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"

interface ServiceDescriptor {
    name: string
    serviceClass: number
    serviceIndex: number
}

interface DeviceDescriptor {
    brain: boolean
    deviceIdentifier: string
    firmwareIdentifier: number
    services: ServiceDescriptor[]
    servicesSeen: ServiceDescriptor[]
}

interface DeviceDescriptorTable {
    descriptors: DeviceDescriptor[]
    headers: string[]
}

function serviceArrayMatched(descriptor: DeviceDescriptor) {
    let matched = true
    descriptor.services.forEach(service => {
        const srv = descriptor.servicesSeen.filter(srv => {
            return (
                srv.serviceClass == service.serviceClass &&
                srv.serviceIndex == service.serviceIndex
            )
        })
        if (srv.length == 0) matched = false
    })
    return matched
}

function dateString() {
    const date = new Date()
    return date.toDateString().replace(/ /g, "-")
}

function isBrain(d: JDDevice) {
    return !!d?.hasService(SRV_ROLE_MANAGER)
}

function DataSetTable(props: {
    dataSet: DeviceDescriptorTable
    className?: string
}) {
    const { dataSet } = props
    const { descriptors, headers } = dataSet

    return (
        <TableContainer component={Paper}>
            <Table aria-label="device table" size="small">
                <TableHead>
                    <TableRow>
                        {headers.map(header => (
                            <TableCell align="right" key={header}>
                                {header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {descriptors?.map(descriptor => (
                        <TableRow key={descriptor.deviceIdentifier}>
                            <TableCell align="center">
                                {descriptor.deviceIdentifier}
                            </TableCell>
                            <TableCell align="center">
                                {descriptor.firmwareIdentifier &&
                                    descriptor.firmwareIdentifier.toString(16)}
                                {descriptor.services.filter(service => {
                                    return (
                                        service.serviceClass == SRV_ROLE_MANAGER
                                    )
                                })?.length && "BRAIN"}
                            </TableCell>
                            <TableCell align="center">
                                {descriptor.services.map(
                                    service => service.name + " "
                                )}
                            </TableCell>
                            <TableCell align="center">
                                {descriptor.servicesSeen.map(
                                    service => service.name + " "
                                )}
                            </TableCell>
                            <TableCell align="center">
                                {serviceArrayMatched(descriptor) && (
                                    <span style={{ color: "green" }}>
                                        <CheckCircle fontSize="small" />
                                        PASS
                                    </span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default function Commissioner() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [filterBrains, setFilterBrains] = useState<boolean>(true)
    const devices = useDevices({
        announced: true,
        ignoreSelf: true,
        ignoreSimulators: true,
    }).filter(d => !filterBrains || !isBrain(d))
    const [dataSet, setDataSet] = useState<DeviceDescriptor[]>()
    const tableHeaders = [
        "Device identifier",
        "Firmware identifier",
        "Services advertised",
        "Services seen",
        "Functional test pass",
    ]
    const { fileStorage } = useContext(ServiceManagerContext)

    useEffectAsync(async () => {
        const newDataSet = (dataSet?.slice(0) || []).filter(
            d => !filterBrains || !d.brain
        )

        for (const d of devices) {
            if (
                newDataSet.filter(entry => entry.deviceIdentifier == d.deviceId)
                    ?.length
            )
                continue

            const services = []
            d.services()
                .filter(service => {
                    return service.serviceClass != SRV_CONTROL
                })
                .forEach((s: JDService) => {
                    services.push({
                        name: s.name,
                        serviceClass: s.serviceClass,
                        serviceIndex: s.serviceIndex,
                    })
                })
            newDataSet.push({
                brain: isBrain(d),
                deviceIdentifier: d.deviceId,
                firmwareIdentifier: await d.resolveFirmwareIdentifier(3),
                services,
                servicesSeen: [],
            })
        }
        setDataSet(newDataSet)
    }, [dependencyId(devices), filterBrains])

    const table = {
        headers: tableHeaders,
        descriptors: dataSet,
    }

    useEffect(
        () =>
            bus.subscribe(PACKET_RECEIVE, (packet: Packet) => {
                const newDataSet = dataSet?.slice(0) || []
                const contains = newDataSet
                    .find(
                        descriptor =>
                            descriptor.deviceIdentifier ==
                            packet.deviceIdentifier
                    )
                    .servicesSeen.filter(
                        service =>
                            service.serviceClass == packet.serviceClass &&
                            service.serviceIndex == packet.serviceIndex
                    )

                if (contains.length) return

                newDataSet
                    .find(
                        descriptor =>
                            descriptor.deviceIdentifier ==
                            packet.deviceIdentifier
                    )
                    ?.servicesSeen.push({
                        name: packet.friendlyServiceName,
                        serviceClass: packet.serviceClass,
                        serviceIndex: packet.serviceIndex,
                    })
                setDataSet(newDataSet)
            }),
        [bus, dataSet]
    )

    const handleOnClearClick = () => {
        setDataSet(undefined)
    }
    const handleDownloadCSV = () => {
        const sep = ","
        const lineEnding = "\r\n"
        let str =
            "device identifier" +
            sep +
            "firmware identifier" +
            sep +
            "services" +
            sep +
            "functional test pass" +
            lineEnding
        dataSet.forEach(descriptor => {
            str += `${descriptor.deviceIdentifier}${sep}`
            if (descriptor.firmwareIdentifier)
                str += `${descriptor.firmwareIdentifier}${sep}`
            else if (
                descriptor.services.find(
                    service => service.serviceClass == SRV_ROLE_MANAGER
                )
            )
                str += `BRAIN${sep}`
            else str += `UNKNOWN${sep}`

            str += `${descriptor.services
                .map(service => service.name)
                .join(" ")}${sep}`

            if (serviceArrayMatched(descriptor)) str += `PASS${lineEnding}`
            else str += `FAIL${lineEnding}`
        })
        fileStorage.saveText(`commissioning-${dateString()}.csv`, str)
    }

    const handleFilterBrains = () => setFilterBrains(!filterBrains)
    const deviceFilter = useCallback(
        d => !filterBrains || !isBrain(d),
        [filterBrains]
    )
    return (
        <>
            <h1>Commissioner</h1>
            <Dashboard
                hideSimulators={true}
                showAvatar={true}
                showHeader={true}
                showConnect={true}
                showStartSimulators={false}
                deviceFilter={deviceFilter}
            />
            <Grid container spacing={1}>
                <GridHeader title={"Commissioning data"} />
                <Grid item xs={12}>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Button
                                aria-label="Clear data"
                                variant="contained"
                                color="primary"
                                onClick={handleOnClearClick}
                            >
                                Clear
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                aria-label="Clear data"
                                variant="contained"
                                color="secondary"
                                onClick={handleDownloadCSV}
                                startIcon={<SaveIcon />}
                            >
                                Download CSV
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                aria-label="Clear data"
                                variant="contained"
                                onClick={handleFilterBrains}
                            >
                                {filterBrains ? "Show brains" : "Hide brains"}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <DataSetTable dataSet={table} />
                </Grid>
            </Grid>
        </>
    )
}
