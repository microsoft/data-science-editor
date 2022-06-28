import React, { useState } from "react"
import { Tabs, Tab } from "@mui/material"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import { Paper } from "@mui/material"
import TabPanel from "../ui/TabPanel"
import Snippet from "../ui/Snippet"
import { converters } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import ServiceSpecification from "./ServiceSpecification"

export default function ServiceSpecificationSource(props: {
    classIdentifier?: number
    serviceSpecification?: jdspec.ServiceSpec
    showSpecification?: boolean
}) {
    const { classIdentifier, serviceSpecification, showSpecification } = props
    const [tab, setTab] = useState(0)
    const spec =
        serviceSpecification ||
        serviceSpecificationFromClassIdentifier(classIdentifier)
    const convs = converters()

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
                {[
                    showSpecification && "Specification",
                    "TypeScript",
                    "C",
                    "JSON",
                ]
                    .filter(n => !!n)
                    .map(n => (
                        <Tab key={n} label={n} />
                    ))}
            </Tabs>
            {showSpecification && (
                <TabPanel key="spec" value={tab} index={index++}>
                    <ServiceSpecification service={spec} />
                </TabPanel>
            )}
            {["ts", "c", "json"].map(lang => (
                <TabPanel key={`conv${lang}`} value={tab} index={index++}>
                    <Snippet
                        copy={true}
                        value={() => convs[lang](spec)}
                        mode={lang}
                        download={`service.${lang}`}
                    />
                </TabPanel>
            ))}
        </Paper>
    )
}
