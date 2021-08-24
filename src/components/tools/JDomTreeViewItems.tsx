import React, { useState, useEffect, useMemo, useCallback } from "react"
// tslint:disable-next-line: no-submodule-imports
// tslint:disable-next-line: no-submodule-imports
// tslint:disable-next-line: no-submodule-imports match-default-export-name
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import JDEvent from "../../../jacdac-ts/src/jdom/event"
import JDService from "../../../jacdac-ts/src/jdom/service"
import JDRegister from "../../../jacdac-ts/src/jdom/register"
import useChange from "../../jacdac/useChange"
import { isRegister, isEvent } from "../../../jacdac-ts/src/jdom/spec"
import { useRegisterHumanValue } from "../../jacdac/useRegisterValue"
import useEventCount from "../../jacdac/useEventCount"
import DeviceActions from "../DeviceActions"
import {
    LOST,
    FOUND,
    SRV_CONTROL,
    SRV_LOGGER,
    GET_ATTEMPT,
    SERVICE_NODE_NAME,
    REGISTER_NODE_NAME,
    EVENT_NODE_NAME,
    SERVICE_MIXIN_NODE_NAME,
    ControlAnnounceFlags,
    SRV_ROLE_MANAGER,
    SRV_SETTINGS,
} from "../../../jacdac-ts/src/jdom/constants"
import useEventRaised from "../../jacdac/useEventRaised"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import { ellipseJoin } from "../../../jacdac-ts/src/jdom/utils"
import useDeviceName from "../devices/useDeviceName"
import {
    StyledTreeItem,
    StyledTreeViewItemProps,
    StyledTreeViewProps,
} from "../ui/StyledTreeView"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import useMediaQueries from "../hooks/useMediaQueries"
import useInstanceName from "../services/useInstanceName"
import useBestRegister from "../hooks/useBestRegister"
import { humanify } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"

export interface JDomTreeViewProps extends StyledTreeViewProps {
    deviceFilter?: (devices: JDDevice) => boolean
    serviceFilter?: (services: JDService) => boolean
    registerFilter?: (register: JDRegister) => boolean
    eventFilter?: (event: JDEvent) => boolean
}

export function DeviceTreeItem(
    props: { device: JDDevice } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { device, serviceFilter, ...other } = props
    const { id, physical } = useMemo(() => device, [device])
    const name = useDeviceName(device, true)
    const kind = physical ? "device" : "virtualdevice"
    const lost = useEventRaised([LOST, FOUND], device, dev => !!dev?.lost)
    const services = useChange(device, () =>
        device
            .services({ mixins: false })
            .filter(srv => !serviceFilter || serviceFilter(srv))
    )
    const { mobile } = useMediaQueries()
    const showActions = !mobile
    const dropped = useChange(device.packetStats, _ => _.dropped)

    const serviceNames = ellipseJoin(
        services
            .filter(
                service =>
                    service.serviceClass !== SRV_CONTROL &&
                    service.serviceClass !== SRV_LOGGER &&
                    service.serviceClass !== SRV_ROLE_MANAGER &&
                    service.serviceClass !== SRV_SETTINGS
            )
            .map(service => service.name),
        18
    )

    const alert = lost
        ? `lost device...`
        : dropped > 2
        ? `${dropped} pkt lost`
        : undefined
    const labelInfo = [dropped > 1 && `${dropped} lost`, serviceNames]
        .filter(r => !!r)
        .join(", ")

    return (
        <StyledTreeItem
            nodeId={id}
            labelText={name}
            labelInfo={labelInfo}
            alert={alert}
            kind={kind}
            actions={
                showActions && (
                    <DeviceActions device={device} showReset={true} />
                )
            }
        >
            <AnnounceFlagsTreeItem device={device} />
            {services?.map(service => (
                <ServiceTreeItem
                    key={service.id}
                    service={service}
                    {...other}
                />
            ))}
        </StyledTreeItem>
    )
}

export function AnnounceFlagsTreeItem(props: { device: JDDevice }) {
    const { device } = props
    const { announceFlags, id, deviceId } = device

    const text = [
        deviceId,
        announceFlags & ControlAnnounceFlags.IsClient && "client",
        announceFlags & ControlAnnounceFlags.SupportsACK && "acks",
        announceFlags & ControlAnnounceFlags.SupportsBroadcast && "broadcast",
        announceFlags & ControlAnnounceFlags.SupportsFrames && "frames",
        (announceFlags & ControlAnnounceFlags.StatusLightRgbFade) ===
            ControlAnnounceFlags.StatusLightMono && "mono status LED",
        (announceFlags & ControlAnnounceFlags.StatusLightRgbFade) ===
            ControlAnnounceFlags.StatusLightRgbNoFade &&
            "rgb no fade status LED",
        (announceFlags & ControlAnnounceFlags.StatusLightRgbFade) ===
            ControlAnnounceFlags.StatusLightRgbFade && "rgb fade status LED",
    ]
        .filter(f => !!f)
        .join(", ")
    return (
        <StyledTreeItem
            nodeId={`${id}:flags`}
            labelText={text}
            labelInfo={`0x${announceFlags.toString(16)}`}
        ></StyledTreeItem>
    )
}

export function ServiceMembersTreeItems(
    props: { service: JDService } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { service, registerFilter, eventFilter, ...other } = props
    const { specification, mixins } = useMemo(() => service, [service])
    const packets = specification?.packets
    const registers = packets
        ?.filter(pkt => !pkt.client && isRegister(pkt))
        .map(info => service.register(info.identifier))
        .filter(reg => !registerFilter || registerFilter(reg))
        .sort((l, r) => l.name.localeCompare(r.name))
    const events = packets
        ?.filter(pkt => !pkt.client && isEvent(pkt))
        .map(info => service.event(info.identifier))
        .filter(ev => !eventFilter || eventFilter(ev))
    return (
        <>
            {registers?.map(register => (
                <RegisterTreeItem
                    key={register.id}
                    register={register}
                    {...other}
                />
            ))}
            {events?.map(event => (
                <EventTreeItem key={event.id} event={event} {...other} />
            ))}
            {mixins?.map(mixin => (
                <ServiceTreeItem key={mixin.id} service={mixin} {...other} />
            ))}
        </>
    )
}

export function ServiceTreeItem(
    props: { service: JDService } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { service } = props
    const { isMixin, name, id } = useMemo(() => service, [service])
    const instanceName = useInstanceName(service)
    const readingRegister = useBestRegister(service)
    const reading = useRegisterHumanValue(readingRegister)

    const labelText = name + (instanceName ? ` ${instanceName}` : "")
    return (
        <StyledTreeItem
            nodeId={id}
            labelText={labelText}
            labelInfo={reading}
            kind={isMixin ? SERVICE_MIXIN_NODE_NAME : SERVICE_NODE_NAME}
        >
            <ServiceMembersTreeItems service={service} {...props} />
        </StyledTreeItem>
    )
}

export function RegisterTreeItem(
    props: { register: JDRegister } & StyledTreeViewItemProps &
        JDomTreeViewProps
) {
    const { register } = props
    const { specification, id, lastGetAttempts } = useMemo(
        () => register,
        [register]
    )
    const [attempts, setAttempts] = useState(lastGetAttempts)
    const optional = !!specification?.optional
    const failedGet = attempts > 2
    const labelText = humanify(
        `${specification?.name || id}${optional ? "?" : ""}`
    )
    const humanValue = useRegisterHumanValue(register, { visible: true })
    const handleClick = useCallback(() => register.sendGetAsync(), [register])

    useEffect(
        () =>
            register?.subscribe(GET_ATTEMPT, () => {
                setAttempts(register.lastGetAttempts)
            }),
        [register]
    )

    // if register is optional and no data, hide
    if (optional && failedGet && humanValue === undefined) return <></>

    return (
        <StyledTreeItem
            nodeId={id}
            labelText={labelText}
            labelInfo={humanValue || (attempts > 0 && `#${attempts}`) || ""}
            kind={specification?.kind || REGISTER_NODE_NAME}
            alert={failedGet && !optional && humanValue === undefined && `???`}
            onClick={handleClick}
        />
    )
}

export function EventTreeItem(
    props: { event: JDEvent } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { event } = props
    const { specification, id } = event
    const count = useEventCount(event)
    const labelText = humanify(specification?.name || event.id)

    return (
        <StyledTreeItem
            nodeId={id}
            labelText={labelText}
            labelInfo={(count || "") + ""}
            kind={EVENT_NODE_NAME}
        />
    )
}
