import React, { useState } from "react"
// tslint:disable-next-line: no-submodule-imports
import Tabs from "@mui/material/Tabs"
// tslint:disable-next-line: no-submodule-imports
import Tab from "@mui/material/Tab"
import { Paper } from "@mui/material"
import TabPanel from "../ui/TabPanel"
import Snippet from "../ui/Snippet"
import DeviceSpecification from "./DeviceSpecification"

export default function DeviceSpecificationSource(props: {
    deviceSpecification?: jdspec.DeviceSpec
    showSpecification?: boolean
    showJSON?: boolean
}) {
    const { deviceSpecification, showSpecification, showJSON } = props
    const [tab, setTab] = useState(0)
    const spec = deviceSpecification

    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newValue: number
    ) => {
        setTab(newValue)
    }

    let index = 0
    return (
        <Paper square>
            <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="View specification formats"
            >
                {[showSpecification && "Specification", showJSON && "JSON"]
                    .filter(n => !!n)
                    .map(n => (
                        <Tab key={n} label={n} />
                    ))}
            </Tabs>
            {showSpecification && (
                <TabPanel key="spec" value={tab} index={index++}>
                    <DeviceSpecification device={spec} />
                </TabPanel>
            )}
            {showJSON && (
                <TabPanel key={`convjson`} value={tab} index={index++}>
                    <Snippet
                        value={JSON.stringify(spec, null, 2)}
                        mode="json"
                    />
                </TabPanel>
            )}
        </Paper>
    )
}
