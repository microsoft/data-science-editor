import React, { useMemo, useCallback } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { JDEvent } from "../../../jacdac-ts/src/jdom/event"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import useChange from "../../jacdac/useChange"
import {
    isRegister,
    isEvent,
    isInfrastructure,
} from "../../../jacdac-ts/src/jdom/spec"
import { useRegisterHumanValue } from "../../jacdac/useRegisterValue"
import useEventCount from "../../jacdac/useEventCount"
import {
    LOST,
    FOUND,
    GET_ATTEMPT,
    SERVICE_NODE_NAME,
    REGISTER_NODE_NAME,
    EVENT_NODE_NAME,
    SERVICE_MIXIN_NODE_NAME,
    ANNOUNCE,
} from "../../../jacdac-ts/src/jdom/constants"
import useEventRaised from "../../jacdac/useEventRaised"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import {
    ellipseJoin,
    roundWithPrecision,
} from "../../../jacdac-ts/src/jdom/utils"
import useDeviceName from "../devices/useDeviceName"
import StyledTreeItem, {
    StyledTreeViewItemProps,
    StyledTreeViewProps,
} from "../ui/StyledTreeItem"
import useInstanceName from "../services/useInstanceName"
import useBestRegister from "../hooks/useBestRegister"
import { humanify } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import DeviceAvatar from "../devices/DeviceAvatar"
import DeviceProductInformationTreeItem from "../devices/DeviceInformationTreeItem"
import AnnounceFlagsTreeItem from "../devices/AnnounceFlagsTreeItem"
import useDeviceDescription from "../../jacdac/useDeviceDescription"

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
    const { id, isPhysical } = useMemo(() => device, [device])
    const name = useDeviceName(device, true)
    const description = useDeviceDescription(device)
    const kind = isPhysical ? "device" : "virtualdevice"
    const lost = useEventRaised([LOST, FOUND], device, dev => !!dev?.lost)
    const services = useEventRaised(ANNOUNCE, device, _ =>
        _.services({ mixins: false }).filter(
            srv => !serviceFilter || serviceFilter(srv)
        )
    )
    const stats = useChange(device, _ => _.stats)
    const dropped = useChange(stats, _ => _.dropped)
    const restarts = useChange(stats, _ => _.restarts)
    const serviceNames = ellipseJoin(
        services
            .filter(srv => !isInfrastructure(srv.specification))
            .map(service => service.name),
        26
    )

    const alert = lost
        ? `lost device...`
        : restarts > 1
        ? `malfunction...`
        : dropped > 2
        ? `${roundWithPrecision(dropped, 1)} pkt lost`
        : undefined
    const warning = restarts > 1 || dropped > 2
    const labelInfo = serviceNames

    return (
        <StyledTreeItem
            nodeId={id}
            labelText={name}
            labelCaption={description}
            labelInfo={labelInfo}
            warning={warning}
            alert={alert}
            kind={kind}
            icon={<DeviceAvatar device={device} size="small" center={false} />}
        >
            <DeviceProductInformationTreeItem device={device} />
            <AnnounceFlagsTreeItem device={device} />
            {services?.map(service => (
                <ServiceTreeItem
                    key={service.nodeId}
                    service={service}
                    showSpecification={true}
                    {...other}
                />
            ))}
        </StyledTreeItem>
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
        .filter(reg => !reg.notImplemented)
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

function ServiceSpecificationTreeItem(props: { service: JDService }) {
    const { service } = props
    const { id, specification } = service
    if (!specification) return null

    const { classIdentifier } = specification
    const nodeId = `${id}:spec`
    const labelText =
        (specification?.notes["short"] || specification.name).split(".", 1)[0] +
        "."
    const labelTo = `/services/${specification.shortId}/`

    return (
        <StyledTreeItem
            nodeId={nodeId}
            labelText={labelText}
            labelInfo={`id: 0x${classIdentifier.toString(16)}`}
            labelTo={labelTo}
        />
    )
}

export function ServiceTreeItem(
    props: {
        service: JDService
        showSpecification?: boolean
        showMembersOnly?: boolean
    } & StyledTreeViewItemProps &
        JDomTreeViewProps
) {
    const { service, showSpecification, showMembersOnly } = props
    const { isMixin, name, id } = useMemo(() => service, [service])
    const instanceName = useInstanceName(service)
    const readingRegister = useBestRegister(service)
    const reading = useRegisterHumanValue(readingRegister, {
        visible: true,
        maxLength: 18,
    })

    const labelText = name + (instanceName ? ` ${instanceName}` : "")
    const members = (
        <>
            {showSpecification && (
                <ServiceSpecificationTreeItem service={service} />
            )}
            <ServiceMembersTreeItems service={service} {...props} />
        </>
    )

    if (showMembersOnly) return members

    return (
        <StyledTreeItem
            nodeId={id}
            labelText={labelText}
            labelInfo={reading}
            kind={isMixin ? SERVICE_MIXIN_NODE_NAME : SERVICE_NODE_NAME}
        >
            {members}
        </StyledTreeItem>
    )
}

export function RegisterTreeItem(
    props: { register: JDRegister } & StyledTreeViewItemProps &
        JDomTreeViewProps
) {
    const { register } = props
    const { specification, id, notImplemented } = register
    const optional = !!specification?.optional
    const labelText = humanify(
        `${specification?.name || id}${optional ? "?" : ""}`
    )
    const humanValue = useRegisterHumanValue(register, {
        visible: true,
    })
    const handleClick = useCallback(() => register.sendGetAsync(), [register])

    const attempts = useEventRaised(
        GET_ATTEMPT,
        register,
        _ => _?.lastGetAttempts
    )
    const failedGet = attempts > 2

    // not implemented
    if (notImplemented) return null
    // if register is optional and no data, hide
    if (optional && failedGet && humanValue === undefined) return null

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
