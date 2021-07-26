import React, { useState, useContext, useEffect } from "react"
// tslint:disable-next-line: no-submodule-imports
import { makeStyles, Theme } from "@material-ui/core/styles"
import { Grid, Button, createStyles } from "@material-ui/core"
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
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        table: {
            minWidth: "10rem",
        },
        root: {
            marginBottom: theme.spacing(1),
        },
        grow: {
            flexGrow: 1,
        },
        field: {
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(1.5),
        },
        segment: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        row: {
            marginBottom: theme.spacing(0.5),
        },
        buttons: {
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(2),
        },
        trend: {
            width: theme.spacing(10),
        },
        vmiddle: {
            verticalAlign: "middle",
        },
        check: {
            color: "green",
        },
    })
)

interface ServiceDescriptor {
    name: string
    serviceClass: number
    serviceIndex: number
}

interface DeviceDescriptor {
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

export function DataSetTable(props: {
    dataSet: DeviceDescriptorTable
    maxRows?: number
    minRows?: number
    className?: string
}) {
    const { dataSet, maxRows, minRows, className } = props
    const { headers } = dataSet
    const classes = useStyles()

    const data = dataSet.descriptors?.slice(
        maxRows !== undefined ? -maxRows : 0
    )
    while (minRows !== undefined && data.length < minRows) data.push(undefined)

    return (
        <TableContainer className={className} component={Paper}>
            <Table
                className={classes.table}
                aria-label="simple table"
                size="small"
            >
                <TableHead>
                    <TableRow>
                        {headers.map(header => (
                            <TableCell align="right" key={`header` + header}>
                                {header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((descriptor, index) => (
                        <TableRow key={`row` + index}>
                            <TableCell key={"cell0"} align="center">
                                {descriptor.deviceIdentifier}
                            </TableCell>
                            <TableCell key={"cell1"} align="center">
                                {descriptor.firmwareIdentifier &&
                                    descriptor.firmwareIdentifier.toString(16)}
                                {descriptor.services.filter(service => {
                                    return (
                                        service.serviceClass == SRV_ROLE_MANAGER
                                    )
                                })?.length && "BRAIN"}
                            </TableCell>
                            <TableCell key={"cell2"} align="center">
                                {descriptor.services.map(
                                    service => service.name + " "
                                )}
                            </TableCell>
                            <TableCell key={"cell3"} align="center">
                                {descriptor.servicesSeen.map(
                                    service => service.name + " "
                                )}
                            </TableCell>
                            <TableCell key={"cell4"} align="center">
                                {serviceArrayMatched(descriptor) && (
                                    <div className={classes.check}>
                                        <CheckCircle />
                                        {"PASS"}
                                    </div>
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
    const [filterBrains, setFilterBrains] = useState<boolean>(false) // todo allow remove brains
    const devices = useDevices({
        ignoreSelf: true,
        ignoreSimulators: true,
    }).filter((d: JDDevice) => {
        if (
            filterBrains &&
            d.services({ serviceClass: SRV_ROLE_MANAGER })?.length
        )
            return false
        return true
    })
    const [dataSet, setDataSet] = useState<DeviceDescriptor[]>()
    const tableHeaders = [
        "Device identifier",
        "Firmware identifier",
        "Services advertised",
        "Services seen",
        "Functional test pass",
    ]
    const [table, setTable] = useState<DeviceDescriptorTable>({
        descriptors: [],
        headers: tableHeaders,
    })

    const { fileStorage } = useContext(ServiceManagerContext)
    const classes = useStyles()

    useEffect(() => {
        const usubArray = []
        const newDataSet = dataSet || []

        devices.forEach(d => {
            if (
                newDataSet.filter(entry => entry.deviceIdentifier == d.deviceId)
                    ?.length
            )
                return

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
                deviceIdentifier: d.deviceId,
                firmwareIdentifier: d.firmwareIdentifier,
                services,
                servicesSeen: [],
            })
        })

        setDataSet(newDataSet)

        return () => {
            usubArray.forEach(usub => usub())
        }
    }, [devices])

    useEffect(() => {
        console.log("UPDATE")
        const newObj = {
            headers: tableHeaders,
            descriptors: dataSet,
        }
        setTable(newObj)
    }, [dataSet])

    useEffect(() => {
        return bus.subscribe(PACKET_RECEIVE, (packet: Packet) => {
            const newDataSet = dataSet.slice(0)
            const contains = newDataSet
                .find(
                    descriptor =>
                        descriptor.deviceIdentifier == packet.deviceIdentifier
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
                        descriptor.deviceIdentifier == packet.deviceIdentifier
                )
                ?.servicesSeen.push({
                    name: packet.friendlyServiceName,
                    serviceClass: packet.serviceClass,
                    serviceIndex: packet.serviceIndex,
                })
            setDataSet(newDataSet)
        })
    }, [bus, dataSet])

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

    const handleFilterBrains = () => {
        filterBrains ? setFilterBrains(false) : setFilterBrains(true)
    }

    return (
        <>
            <h1>Commissioner</h1>
            <Dashboard
                hideSimulators={true}
                showAvatar={true}
                showHeader={true}
                showConnect={true}
                showStartSimulators={false}
            />
            <Grid container spacing={1}>
                <GridHeader title={"Commissioning data"} />
                <Grid item xs={1}>
                    <Button
                        aria-label="Clear data"
                        variant="contained"
                        color="primary"
                        onClick={handleOnClearClick}
                    >
                        Clear
                    </Button>
                </Grid>
                <Grid item xs={2}>
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
                <Grid item xs={2}>
                    <Button
                        aria-label="Clear data"
                        variant="contained"
                        onClick={handleFilterBrains}
                    >
                        {filterBrains
                            ? "Stop filtering brains"
                            : "Start filtering brains"}
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <DataSetTable
                        key="datasettable"
                        className={classes.segment}
                        dataSet={table}
                    />
                </Grid>
            </Grid>
        </>
    )
}
