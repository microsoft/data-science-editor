import React, { useState } from "react"
import { Tabs, Tab } from "@mui/material"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import { Paper } from "@mui/material"
import TabPanel from "../ui/TabPanel"
import Snippet from "../ui/Snippet"
import { converters } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import ServiceSpecification from "./ServiceSpecification"
import { serviceSpecificationToServiceTwinSpecification } from "../../../jacdac-ts/src/azure-iot/devicetwin"
import { withPrefix } from "gatsby"

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
    const showDeviceTwin = spec && spec?.camelName !== "sytem"

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
                    "MakeCode",
                    "TypeScript",
                    "C",
                    "JSON",
                    showDeviceTwin && "Twin",
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
            {["sts", "ts", "c", "json"].map(lang => (
                <TabPanel key={`conv${lang}`} value={tab} index={index++}>
                    <Snippet value={() => convs[lang](spec)} mode={lang} />
                </TabPanel>
            ))}
            {showDeviceTwin && (
                <TabPanel key="devicetwin" value={tab} index={index++}>
                    <Snippet
                        mode="json"
                        url={withPrefix(
                            `/services/twin/x${spec.classIdentifier.toString(
                                16
                            )}.json`
                        )}
                        value={JSON.stringify(
                            serviceSpecificationToServiceTwinSpecification(
                                spec
                            ),
                            null,
                            2
                        )}
                    />
                </TabPanel>
            )}
        </Paper>
    )
}
