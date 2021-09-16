import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Tab,
    Tabs,
} from "@material-ui/core"
import React, { Fragment, useState } from "react"
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

function FlashDiagnostics() {
    const blobs = useFirmwareBlobs()
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
    const [tab, setTab] = useState(0)
    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newValue: number
    ) => {
        setTab(newValue)
    }

    return (
        <Box mb={2}>
            <ConnectAlert />
            <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="View specification formats"
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
            <SafeBootAlert />
            <ManualFirmwareAlert />
            {Flags.diagnostics && <FlashDiagnostics />}
        </Box>
    )
}
