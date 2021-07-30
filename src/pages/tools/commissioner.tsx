import React, { useState, useContext, useEffect, useCallback } from "react"
// tslint:disable-next-line: no-submodule-imports
import { Grid, Button, TextField } from "@material-ui/core"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
// tslint:disable-next-line: no-submodule-imports match-default-export-name
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SaveIcon from "@material-ui/icons/Save"
import CheckCircle from "@material-ui/icons/CheckCircle"
import CancelIcon from "@material-ui/icons/Cancel"
// tslint:disable-next-line: no-submodule-imports
import useDevices from "../../components/hooks/useDevices"
import {
    PACKET_RECEIVE,
    SRV_CONTROL,
    SRV_LED_PIXEL,
    SRV_LED,
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
import { delay } from "../../../jacdac-ts/src/jdom/utils"
import { dependencyId } from "../../../jacdac-ts/src/jdom/eventsource"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { lightEncode } from "../../../jacdac-ts/src/jdom/light"
import { LedPixelCmd, LedCmd } from "../../../jacdac-ts/src/jdom/constants"
import { createStyles, makeStyles } from "@material-ui/core"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"

const useStyles = makeStyles(() =>
    createStyles({
        buttonFail: {
            color: "white",
            backgroundColor: "red",
        },
        buttonSuccess: {
            color: "white",
            backgroundColor: "green",
        },
    })
)

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
    pass: boolean
    comment: string
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
    updateDescriptor: (DeviceDescriptor) => void
    className?: string
}) {
    const classes = useStyles()
    const { dataSet, updateDescriptor } = props
    const { descriptors, headers } = dataSet

    const setPass =
        (deviceDescriptor: DeviceDescriptor, state: boolean) => () => {
            deviceDescriptor.pass = state
            updateDescriptor(deviceDescriptor)
        }

    const handleCommentChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const descriptor = descriptors.find(
            d => d.deviceIdentifier == event.target.id
        )
        descriptor.comment = event.target.value
        updateDescriptor(descriptor)
    }

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
                            <TableCell align="center">
                                {descriptor.pass && (
                                    <Button
                                        aria-label="Toggle pass state"
                                        variant="contained"
                                        className={classes.buttonSuccess}
                                        onClick={setPass(descriptor, false)}
                                        startIcon={
                                            <CheckCircle fontSize="small" />
                                        }
                                    >
                                        Pass
                                    </Button>
                                )}
                                {!descriptor.pass && (
                                    <Button
                                        aria-label="Toggle pass state"
                                        variant="contained"
                                        className={classes.buttonFail}
                                        onClick={setPass(descriptor, true)}
                                        startIcon={
                                            <CancelIcon fontSize="small" />
                                        }
                                    >
                                        FAIL
                                    </Button>
                                )}
                            </TableCell>
                            <TableCell align="center">
                                <TextField
                                    onChange={handleCommentChange}
                                    id={descriptor.deviceIdentifier}
                                    label="Comment"
                                    fullWidth
                                    value={descriptor.comment}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

async function LEDTest(service: JDService) {
    while (service.device.connected) {
        for (let i = 0; i < 8; i++) {
            const encoded = lightEncode(
                `setone % #
                    show 20`,
                [i, 0xff0000]
            )

            if (service.device.connected)
                await service?.sendCmdAsync(LedPixelCmd.Run, encoded)
            await delay(200)
        }
    }
}

async function SingleRGBLEDTest(service: JDService) {
    const pack = (r, g, b, animDelay) => {
        const unpacked: [number, number, number, number] = [r, g, b, animDelay]
        return jdpack("u8 u8 u8 u8", unpacked)
    }

    while (service.device.connected) {
        await service.sendCmdAsync(LedCmd.Animate, pack(255, 0, 0, 200))
        await delay(500)
        await service.sendCmdAsync(LedCmd.Animate, pack(0, 255, 0, 200))
        await delay(500)
        await service.sendCmdAsync(LedCmd.Animate, pack(0, 0, 255, 200))
        await delay(500)
    }
}

async function StatusLEDTest(device: JDDevice) {
    const l = device.statusLight;
    while(device.connected) {
        l.blink(0xff0000,0x000000,250, 3);
        await delay(1000);
        l.blink(0x00ff00,0x000000,250, 3);
        await delay(1000);
        l.blink(0x0000ff,0x000000,250, 3);
        await delay(1000);
    }
}

export default function Commissioner() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [filterBrains, setFilterBrains] = useState<boolean>(true)
    const devices = useDevices({
        announced: true,
        ignoreSelf: true,
        ignoreSimulators: true,
    }).filter(d => !filterBrains || !isBrain(d))
    const [title, setTitle] = useState("")
    const [dataSet, setDataSet] = useState<DeviceDescriptor[]>()
    const tableHeaders = [
        "Device identifier",
        "Firmware identifier",
        "Services advertised",
        "Services seen",
        "Packets seen",
        "Functional test pass",
        "Comment",
    ]
    const { fileStorage } = useContext(ServiceManagerContext)

    const testDevice = async (d: JDDevice) => {
        StatusLEDTest(d);
        for (const srv of d.services()) {
            switch (srv.serviceClass) {
                case SRV_LED_PIXEL:
                    LEDTest(srv)
                    break
                case SRV_LED:
                    SingleRGBLEDTest(srv)
                    break
            }
        }
    }

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
                pass: true,
                comment: "",
            })
            // launch tests
            testDevice(d)
        }
        setDataSet(newDataSet)
    }, [dependencyId(devices), filterBrains])

    const table = {
        headers: tableHeaders,
        descriptors: dataSet,
    }

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
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
            "Packets seen" +
            sep +
            "Functional test pass" +
            sep +
            "Comment" +
            lineEnding
        dataSet.forEach(descriptor => {
            str += `0x${descriptor.deviceIdentifier}${sep}`
            if (descriptor.firmwareIdentifier)
                str += `0x${descriptor.firmwareIdentifier.toString(16)}${sep}`
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

            if (serviceArrayMatched(descriptor)) str += `YES${sep}`
            else str += `NO${sep}`

            if (descriptor.pass) str += `PASS${sep}`
            else str += `FAIL${sep}`

            str += descriptor.comment + lineEnding
        })

        const fileTitle = title.length ? `${title}-` : "" 
        fileStorage.saveText(
            `${fileTitle}commissioning-${dateString()}.csv`,
            str
        )
    }

    const handleFilterBrains = () => setFilterBrains(!filterBrains)
    const deviceFilter = useCallback(
        d => !filterBrains || !isBrain(d),
        [filterBrains]
    )

    const handleUpdateDescriptor = descriptor => {
        const newDataSet = dataSet?.slice(0) || []
        const el = newDataSet.find(
            d => d.deviceIdentifier == descriptor.deviceIdentifier
        )
        if (el) {
            el.comment = descriptor.comment
            el.pass = descriptor.pass
            setDataSet(newDataSet)
        }
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
                        <Grid item>
                            <TextField
                                onChange={handleTitleChange}
                                label="Title"
                                fullWidth
                                value={title}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <DataSetTable
                        dataSet={table}
                        updateDescriptor={handleUpdateDescriptor}
                    />
                </Grid>
            </Grid>
        </>
    )
}
