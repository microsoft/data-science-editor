import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Tab,
    Tabs,
} from "@mui/material"
import React, { Fragment, useContext, useState } from "react"
import TabPanel from "../ui/TabPanel"
import ConnectAlert from "../alert/ConnectAlert"
import FirmwareCardGrid from "../firmware/FirmwareCardGrid"
// tslint:disable-next-line: no-submodule-imports
import UpdateDeviceList from "../UpdateDeviceList"
import SafeBootAlert from "../firmware/SafeBootAlert"
import ManualFirmwareAlert from "../firmware/ManualFirmwareAlert"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import useFirmwareBlobs from "../firmware/useFirmwareBlobs"
import GridHeader from "../ui/GridHeader"
import { groupBy } from "../../../jacdac-ts/src/jdom/utils"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { FLASH_MAX_DEVICES } from "../../../jacdac-ts/src/jdom/constants"
import useChange from "../../jacdac/useChange"
import Alert from "../ui/Alert"
import { AlertTitle } from "@mui/material"
import FirmwareLoader from "../firmware/FirmwareLoader"

function FlashDiagnostics() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const blobs = useChange(bus, _ => _?.firmwareBlobs)
    const stores = groupBy(blobs, blob => blob.store)
    return (
        <Grid container spacing={2}>
            {Object.entries(stores).map(([store, blobs]) => (
                <Fragment key={store}>
                    <GridHeader title={store} />
                    {blobs?.map(blob => (
                        <Grid item key={blob.store + blob.productIdentifier}>
                            <Card>
                                <CardHeader
                                    title={blob.name}
                                    subheader={blob.version}
                                />
                                <CardContent>
                                    pid: 0x{blob.productIdentifier.toString(16)}
                                    , {blob.pages.length} pages
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Fragment>
            ))}
        </Grid>
    )
}

export default function Flash() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [tab, setTab] = useState(0)
    const { throttled } = useFirmwareBlobs()
    const devices = useChange(bus, _ => _.devices({ physical: true }))

    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newValue: number
    ) => {
        setTab(newValue)
    }

    return (
        <Box mb={2}>
            {throttled && (
                <Alert severity="error">
                    <AlertTitle>Try again later...</AlertTitle>
                    Oops, it looks like we have been polling firmware too much
                    from GitHub. Please try again later.
                </Alert>
            )}
            {devices?.length > FLASH_MAX_DEVICES && (
                <Alert severity="error">
                    <AlertTitle>Too many connected devices</AlertTitle>
                    Please unplug some of your devices before updating.
                </Alert>
            )}
            <ConnectAlert />
            <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="Update firmware of modules"
            >
                <Tab label={`Updates`} />
                <Tab label={`Firmwares`} />
            </Tabs>
            <TabPanel value={tab} index={0}>
                <UpdateDeviceList />
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <FirmwareCardGrid />
            </TabPanel>
            <SafeBootAlert proxy={true} />
            <ManualFirmwareAlert />
            {Flags.diagnostics && <FlashDiagnostics />}
            <FirmwareLoader />
        </Box>
    )
}
