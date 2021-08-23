import React, { useContext } from "react"
import { Typography } from "@material-ui/core"
import { InPipeReader } from "../../jacdac-ts/src/jdom/pipes"
import JDService from "../../jacdac-ts/src/jdom/service"
import DeviceName from "./devices/DeviceName"
import { isReportOf } from "../../jacdac-ts/src/jdom/spec"
import { packArguments } from "../../jacdac-ts/src/jdom/command"
import {
    DecodedPacket,
    printPacket,
    serviceName,
} from "../../jacdac-ts/src/jdom/pretty"
import Packet from "../../jacdac-ts/src/jdom/packet"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import CmdButton from "./CmdButton"
import { PackedValues } from "../../jacdac-ts/src/jdom/pack"

function hasPipeReport(info: jdspec.PacketInfo) {
    return info.fields.find(f => f.type == "pipe")
}

export default function CommandInput(props: {
    service: JDService
    command: jdspec.PacketInfo
    showDeviceName?: boolean
    args?: PackedValues
    setReports?: (reports: DecodedPacket[]) => void
}) {
    const { service, command, showDeviceName, args, setReports } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)

    const { specification } = service
    const requiredArgLength =
        command.fields.length - (hasPipeReport(command) ? 1 : 0)
    const missingArguments = (args?.length || 0) !== requiredArgLength
    const disabled = missingArguments
    const reportSpec =
        command.hasReport &&
        specification.packets.find(p => isReportOf(command, p))
    const handleClick = async () => {
        const pkt = !args?.length
            ? Packet.onlyHeader(command.identifier)
            : packArguments(command, args)
        if (setReports && reportSpec) {
            const reportPacket = await service.sendCmdAwaitResponseAsync(pkt)
            const decoded = reportPacket?.decoded
            setReports([decoded])
        } else if (setReports && hasPipeReport(command)) {
            let inp: InPipeReader
            try {
                inp = new InPipeReader(bus)
                const cmd = inp.openCommand(command.identifier)
                await service.sendPacketAsync(cmd, true)
                console.log(printPacket(cmd)) // keep this call, it sets up pretty to understand packages
                const { output } = await inp.readAll()
                const reports = output
                    .filter(ot => !!ot.data?.length)
                    .map(ot => ot?.decoded)
                setReports(reports)
            } finally {
                inp?.unmount()
            }
        } else await service.sendPacketAsync(pkt, true)
    }

    return (
        <CmdButton
            trackName={`command.input`}
            trackProperties={{
                service: serviceName(service.serviceClass),
                serviceClass: service.serviceClass,
            }}
            variant="contained"
            disabled={disabled}
            onClick={handleClick}
        >
            {showDeviceName && (
                <Typography>
                    <DeviceName device={service.device} />/
                </Typography>
            )}
            {command.name.replace(/_/g, " ")}
        </CmdButton>
    )
}
