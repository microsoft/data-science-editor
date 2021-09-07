import {
    isRegister,
    isEvent,
    isCommand,
} from "../../../jacdac-ts/src/jdom/spec"
// tslint:disable-next-line: no-submodule-imports
import Alert from "../ui/Alert"
import React from "react"
// tslint:disable-next-line: no-submodule-imports
import Chip from "@material-ui/core/Chip"
import DeviceList from "../DeviceList"
import { makeStyles, createStyles } from "@material-ui/core"
import IDChip from "../IDChip"
import KindChip from "../KindChip"
import PacketMembersChip from "../PacketMembersChip"
import Markdown from "../ui/Markdown"
import { prettyMemberUnit } from "../../../jacdac-ts/src/jdom/pretty"

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            marginBottom: theme.spacing(1),
        },
        field: {
            "& > div": { verticalAlign: "middle" },
        },
        chip: {
            margin: theme.spacing(0.5),
        },
    })
)

function MemberType(props: { member: jdspec.PacketMember }) {
    const { member } = props
    const classes = useStyles()
    const helperText = prettyMemberUnit(member, true)

    return (
        <>
            <li className={classes.field}>
                {member.name !== "_" && `${member.name}: `}
                <code>{helperText}</code>
            </li>
        </>
    )
}

function MembersType(props: {
    members: jdspec.PacketMember[]
    title?: string
}) {
    const { members, title } = props

    let repeatIndex = members.findIndex(m => !!m.startRepeats)
    if (repeatIndex < 0) repeatIndex = members.length
    const beforeRepeat = members.slice(0, repeatIndex)
    const afterRepeat = members.slice(repeatIndex)

    return (
        <>
            {!!title && <h4>{title}</h4>}
            {!!beforeRepeat.length && (
                <ul>
                    {beforeRepeat.map((member, i) => (
                        <MemberType
                            key={`member${member.name}`}
                            member={member}
                        />
                    ))}
                </ul>
            )}
            {!!afterRepeat.length && (
                <>
                    <h5>starts repeating</h5>
                    <ul>
                        {afterRepeat.map((member, i) => (
                            <MemberType
                                key={`member${member.name}`}
                                member={member}
                            />
                        ))}
                    </ul>
                </>
            )}
        </>
    )
}

export default function PacketSpecification(props: {
    serviceClass: number
    packetInfo: jdspec.PacketInfo
    reportInfo?: jdspec.PacketInfo
    pipeReportInfo?: jdspec.PacketInfo
    showDevices?: boolean
}) {
    const {
        serviceClass,
        packetInfo,
        reportInfo,
        pipeReportInfo,
        showDevices,
    } = props
    const classes = useStyles()
    if (!packetInfo)
        return (
            <Alert severity="error">{`Unknown member ${serviceClass.toString(
                16
            )}:${packetInfo.identifier}`}</Alert>
        )
    const { fields } = packetInfo
    const isCmd = isCommand(packetInfo)

    return (
        <div className={classes.root}>
            <h3 id={`${packetInfo.kind}:${packetInfo.identifier}`}>
                {packetInfo.name}
                <PacketMembersChip
                    spec={packetInfo}
                    className={classes.chip}
                    members={packetInfo.fields}
                />
                {packetInfo.identifier !== undefined && (
                    <IDChip
                        className={classes.chip}
                        id={packetInfo.identifier}
                        filter={`pkt:0x${packetInfo.identifier.toString(16)}`}
                    />
                )}
                <KindChip className={classes.chip} kind={packetInfo.kind} />
                {packetInfo.optional && (
                    <Chip
                        className={classes.chip}
                        size="small"
                        label="optional"
                    />
                )}
                {packetInfo.derived && (
                    <Chip
                        className={classes.chip}
                        size="small"
                        label="derived"
                    />
                )}
            </h3>
            <Markdown source={packetInfo.description} />
            {!!fields.length && (
                <MembersType members={fields} title={isCmd && "Arguments"} />
            )}
            {!!reportInfo && (
                <MembersType members={reportInfo.fields} title="Report" />
            )}
            {!!pipeReportInfo && (
                <MembersType
                    members={pipeReportInfo.fields}
                    title="Pipe report"
                />
            )}
            {showDevices && isCommand(packetInfo) && (
                <DeviceList
                    serviceClass={serviceClass}
                    commandIdentifier={packetInfo.identifier}
                />
            )}
            {showDevices && isRegister(packetInfo) && (
                <DeviceList
                    serviceClass={serviceClass}
                    registerIdentifiers={[packetInfo.identifier]}
                />
            )}
            {showDevices && isEvent(packetInfo) && (
                <DeviceList
                    serviceClass={serviceClass}
                    eventIdentifiers={[packetInfo.identifier]}
                />
            )}
        </div>
    )
}
