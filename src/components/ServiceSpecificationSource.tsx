import React, { useState } from "react"
import { Tabs, Tab } from "@material-ui/core"
import { serviceSpecificationFromClassIdentifier } from "../../jacdac-ts/src/jdom/spec"
import { Paper, createStyles, makeStyles, Theme } from "@material-ui/core"
import TabPanel from "./ui/TabPanel"
import Snippet from "./ui/Snippet"
import { converters } from "../../jacdac-ts/jacdac-spec/spectool/jdspec"
import ServiceSpecification from "./ServiceSpecification"
import { DTDLSnippet } from "./azure/DTDLSnippet"
import { serviceSpecificationToDTDL } from "../../jacdac-ts/src/azure-iot/dtdlspec"
import { serviceSpecificationToDeviceTwinSpecification } from "../../jacdac-ts/src/azure-iot/devicetwin"
import { withPrefix } from "gatsby"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            backgroundColor: theme.palette.background.paper,
            marginBottom: theme.spacing(1),
        },
        pre: {
            margin: "0",
            padding: "0",
            backgroundColor: "transparent",
            whiteSpec: "pre-wrap",
        },
    })
)

export default function ServiceSpecificationSource(props: {
    classIdentifier?: number
    serviceSpecification?: jdspec.ServiceSpec
    showSpecification?: boolean
}) {
    const { classIdentifier, serviceSpecification, showSpecification } = props
    const classes = useStyles()
    const [tab, setTab] = useState(0)
    const spec =
        serviceSpecification ||
        serviceSpecificationFromClassIdentifier(classIdentifier)
    const convs = converters()
    const showDTDL = spec && spec?.camelName !== "system"
    const showDeviceTwin = spec && spec?.camelName !== "sytem"

    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newValue: number
    ) => {
        setTab(newValue)
    }

    let index = 0
    return (
        <div className={classes.root}>
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
                        showDTDL && "DTDL",
                        showDeviceTwin && "Device Twin",
                    ]
                        .filter(n => !!n)
                        .map((n, i) => (
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
                {showDTDL && (
                    <TabPanel key="dtdl" value={tab} index={index++}>
                        <DTDLSnippet node={serviceSpecificationToDTDL(spec)} />
                    </TabPanel>
                )}
                {showDeviceTwin && (
                    <TabPanel key="dtdl" value={tab} index={index++}>
                        <Snippet
                            mode="json"
                            url={withPrefix(
                                `/services/devicetwins/x${spec.classIdentifier.toString(
                                    16
                                )}.json`
                            )}
                            value={JSON.stringify(
                                serviceSpecificationToDeviceTwinSpecification(
                                    spec
                                ),
                                null,
                                2
                            )}
                        />
                    </TabPanel>
                )}
            </Paper>
        </div>
    )
}
