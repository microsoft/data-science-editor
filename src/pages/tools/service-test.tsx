import React, { useState } from "react"
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from "@material-ui/core"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import useGridBreakpoints from "../../components/useGridBreakpoints"
import useDevices from "../../components/hooks/useDevices"
import DeviceCardHeader from "../../components/DeviceCardHeader"
import JDService from "../../../jacdac-ts/src/jdom/service"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import ConnectAlert from "../../components/alert/ConnectAlert"
import ServiceTestRunner from "../../components/test/ServiceTestRunner"

function DeviceItem(props: {
    device: JDDevice
    serviceUnderTest: JDService
    onServiceUnderTestSelected: (service: JDService) => void
}) {
    const { device, serviceUnderTest, onServiceUnderTestSelected } = props
    const services = useChange(device, d => d.services({ specification: true }))
    const gridBreakpoints = useGridBreakpoints()
    const handleServiceSelected = (service: JDService) => () =>
        onServiceUnderTestSelected(service)
    return (
        <Grid item {...gridBreakpoints}>
            <Card>
                <DeviceCardHeader device={device} showAvatar={true} showReset={true} />
                <CardContent>
                    <Typography variant="caption">
                        Select a service to test.
                    </Typography>
                </CardContent>
                <CardActions>
                    <Grid container spacing={1}>
                        {services?.map(service => (
                            <Grid item key={service.id}>
                                <Button
                                    variant={
                                        serviceUnderTest === service
                                            ? "contained"
                                            : "outlined"
                                    }
                                    color={
                                        serviceUnderTest === service
                                            ? "primary"
                                            : undefined
                                    }
                                    onClick={handleServiceSelected(service)}
                                >
                                    {service.name}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </CardActions>
            </Card>
        </Grid>
    )
}

export default function Page() {
    const devices = useDevices({ announced: true })
    const [serviceUnderTest, setServiceUnderTest] = useState<JDService>(
        undefined
    )
    return (
        <>
            <h1>Service Tests</h1>
            <p>Connect devices to test its services.</p>
            <ConnectAlert />
            <Grid container spacing={2}>
                {devices?.map(device => (
                    <DeviceItem
                        key={device.id}
                        device={device}
                        serviceUnderTest={serviceUnderTest}
                        onServiceUnderTestSelected={setServiceUnderTest}
                    />
                ))}
            </Grid>
            {serviceUnderTest && <Grid item xs={12}>
                <ServiceTestRunner service={serviceUnderTest} />
            </Grid>}
        </>
    )
}
