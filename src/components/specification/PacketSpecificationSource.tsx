import React, { useState } from "react"
import { Tabs, Tab } from "@material-ui/core"
import TabPanel from "../ui/TabPanel"
import Snippet from "../ui/Snippet"
import { packInfo } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import {
    isRegister,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
import PaperBox from "../ui/PaperBox"

export default function PacketSpecificationSource(props: {
    serviceClass: number
    packetInfo: jdspec.PacketInfo
    reportInfo?: jdspec.PacketInfo
    pipeReportInfo?: jdspec.PacketInfo
}) {
    const { serviceClass, packetInfo, reportInfo, pipeReportInfo } = props
    const [tab, setTab] = useState(0)

    const info = serviceSpecificationFromClassIdentifier(serviceClass)
    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newValue: number
    ) => {
        setTab(newValue)
    }

    // TODO: render commands
    if (!packetInfo?.fields?.length || !isRegister(packetInfo)) return null
    const { kind } = packetInfo

    let index = 0
    return (
        <PaperBox>
            <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="View specification formats"
            >
                {["TypeScript"]
                    .filter(n => !!n)
                    .map(n => (
                        <Tab key={n} label={n} />
                    ))}
            </Tabs>
            <TabPanel value={tab} index={index++}>
                <Snippet
                    value={() =>
                        [
                            "// get (register to REPORT_UPDATE event to enable background refresh)",
                            packInfo(info, packetInfo, {
                                isStatic: false,
                                useBooleans: false,
                                useJDOM: true,
                            }).buffers,
                            kind == "rw" && "// set",
                            kind == "rw" &&
                                packInfo(info, packetInfo, {
                                    isStatic: false,
                                    useBooleans: false,
                                    useJDOM: true,
                                    useSet: true,
                                }).buffers,
                        ]
                            .filter(l => !!l)
                            .join("\n")
                    }
                    mode={"typescript"}
                />
            </TabPanel>
        </PaperBox>
    )
}
