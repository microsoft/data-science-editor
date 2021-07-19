import { Box, Tab, Tabs } from "@material-ui/core"
import React, { useState } from "react"
import TabPanel from "../ui/TabPanel"
import ConnectAlert from "../alert/ConnectAlert"
import FirmwareCardGrid from "../firmware/FirmwareCardGrid"
// tslint:disable-next-line: no-submodule-imports
import UpdateDeviceList from "../UpdateDeviceList"
import SafeBootAlert from "../firmware/SafeBootAlert"
import ManualFirmwareAlert from "../firmware/ManualFirmwareAlert"

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
        </Box>
    )
}
