import React, { useState } from "react"
import { Tabs, Tab } from "@mui/material"
import TabPanel from "../ui/TabPanel"
import Snippet from "../ui/Snippet"
import { packInfo } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import {
    isCommand,
    isEvent,
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
    const { serviceClass, packetInfo } = props
    const [tab, setTab] = useState(0)

    const info = serviceSpecificationFromClassIdentifier(serviceClass)
    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newValue: number
    ) => {
        setTab(newValue)
    }

    // TODO: render commands
    if (
        !info ||
        !packetInfo?.fields?.length ||
        !(isRegister(packetInfo) || isCommand(packetInfo) || isEvent(packetInfo))
    )
        return null

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
                        packInfo(info, packetInfo, {
                            isStatic: false,
                            useBooleans: false,
                            useJDOM: true,
                        }).buffers
                    }
                    mode={"typescript"}
                />
            </TabPanel>
        </PaperBox>
    )
}
