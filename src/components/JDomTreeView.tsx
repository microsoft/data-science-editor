import React, { useContext, useState, useEffect } from "react"
import clsx from "clsx"
// tslint:disable-next-line: no-submodule-imports
import { makeStyles, createStyles } from "@material-ui/core/styles"
// tslint:disable-next-line: no-submodule-imports
import TreeView from "@material-ui/lab/TreeView"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ArrowRightIcon from "@material-ui/icons/ArrowRight"
import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import { JDEvent } from "../../jacdac-ts/src/jdom/event"
import { JDService } from "../../jacdac-ts/src/jdom/service"
import { JDRegister } from "../../jacdac-ts/src/jdom/register"
import useChange from "../jacdac/useChange"
import { isRegister, isEvent } from "../../jacdac-ts/src/jdom/spec"
import { useMediaQuery, useTheme } from "@material-ui/core"
import {
    useRegisterHumanValue,
    useRegisterUnpackedValue,
} from "../jacdac/useRegisterValue"
import useEventCount from "../jacdac/useEventCount"
import DeviceActions from "./DeviceActions"
import {
    LOST,
    FOUND,
    SRV_CTRL,
    SRV_LOGGER,
    GET_ATTEMPT,
    BaseReg,
} from "../../jacdac-ts/src/jdom/constants"
import useEventRaised from "../jacdac/useEventRaised"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import { ellipseJoin } from "../../jacdac-ts/src/jdom/utils"
import { Link } from "gatsby-theme-material-ui"
import useDeviceName from "./devices/useDeviceName"
import ConnectAlert from "./alert/ConnectAlert"
import {
    StyledTreeItem,
    StyledTreeViewItemProps,
    StyledTreeViewProps,
} from "./ui/StyledTreeView"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import LaunchIcon from "@material-ui/icons/Launch"
import AppContext, { DrawerType } from "./AppContext"
import { MOBILE_BREAKPOINT } from "./layout"
import useDevices from "./hooks/useDevices"

function DeviceTreeItem(
    props: { device: JDDevice } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const {
        device,
        checked,
        setChecked,
        checkboxes,
        serviceFilter,
        ...other
    } = props
    const id = device.id
    const name = useDeviceName(device, true)
    const physical = useChange(device, d => d.physical)
    const kind = physical ? "device" : "virtualdevice"
    const lost = useEventRaised([LOST, FOUND], device, dev => !!dev?.lost)
    const services = useChange(device, () =>
        device.services().filter(srv => !serviceFilter || serviceFilter(srv))
    )
    const theme = useTheme()
    const showActions = useMediaQuery(theme.breakpoints.up("sm"))
    const dropped = useChange(device.qos, qos => qos.dropped)

    const serviceNames = ellipseJoin(
        services
            .filter(
                service =>
                    service.serviceClass !== SRV_CTRL &&
                    service.serviceClass !== SRV_LOGGER
            )
            .map(service => service.name),
        18
    )

    const alert = lost
        ? `lost device...`
        : dropped > 2
            ? `${dropped} pkt lost`
            : undefined
    const labelInfo = [!!dropped && `${dropped} lost`, serviceNames]
        .filter(r => !!r)
        .join(", ")

    const handleChecked = c => setChecked(id, c)
    return (
        <StyledTreeItem
            nodeId={id}
            labelText={name}
            labelInfo={labelInfo}
            alert={alert}
            kind={kind}
            checked={checked?.indexOf(id) > -1}
            setChecked={
                checkboxes &&
                checkboxes.indexOf("device") > -1 &&
                setChecked &&
                handleChecked
            }
            actions={
                showActions && (
                    <DeviceActions device={device} showReset={true} />
                )
            }
        >
            {services?.map(service => (
                <ServiceTreeItem
                    key={service.id}
                    service={service}
                    checked={checked}
                    setChecked={setChecked}
                    checkboxes={checkboxes}
                    {...other}
                />
            ))}
        </StyledTreeItem>
    )
}

function ServiceTreeItem(
    props: { service: JDService } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const {
        service,
        checked,
        setChecked,
        checkboxes,
        registerFilter,
        eventFilter,
        ...other
    } = props
    const specification = service.specification
    const showSpecificationAction = false
    const id = service.id
    const open = checked?.indexOf(id) > -1
    const packets = specification?.packets
    const registers = packets
        ?.filter(isRegister)
        .map(info => service.register(info.identifier))
        .filter(reg => !registerFilter || registerFilter(reg))
        .sort((l, r) => l.name.localeCompare(r.name))
    const events = packets
        ?.filter(isEvent)
        .map(info => service.event(info.identifier))
        .filter(ev => !eventFilter || eventFilter(ev))
    const [instanceName] = useRegisterUnpackedValue<[string]>(
        service.register(BaseReg.InstanceName)
    )
    const readingRegister = service.readingRegister
    const reading = useRegisterHumanValue(readingRegister)

    const name = service.name + (instanceName ? ` ${instanceName}` : "")
    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT))
    const { setDrawerType } = useContext(AppContext)

    const handleSpecClick = () => {
        console.log(`spec click`, { mobile })
        if (mobile) setDrawerType(DrawerType.None)
    }
    const handleChecked = c => setChecked(id, c)
    return (
        <StyledTreeItem
            nodeId={id}
            labelText={name}
            labelInfo={reading}
            kind={"service"}
            checked={open}
            setChecked={
                checkboxes?.indexOf("service") > -1 &&
                setChecked &&
                handleChecked
            }
            actions={
                showSpecificationAction ? (
                    <Link
                        color="inherit"
                        to={`/services/${specification.shortId}/`}
                        aria-label={"Open specification"}
                        onClick={handleSpecClick}
                    >
                        <LaunchIcon fontSize={"small"} />
                    </Link>
                ) : undefined
            }
        >
            {registers?.map(register => (
                <RegisterTreeItem
                    key={register.id}
                    register={register}
                    checked={checked}
                    setChecked={setChecked}
                    checkboxes={checkboxes}
                    {...other}
                />
            ))}
            {events?.map(event => (
                <EventTreeItem
                    key={event.id}
                    event={event}
                    checked={checked}
                    setChecked={setChecked}
                    checkboxes={checkboxes}
                    {...other}
                />
            ))}
        </StyledTreeItem>
    )
}

function RegisterTreeItem(
    props: { register: JDRegister } & StyledTreeViewItemProps &
        JDomTreeViewProps
) {
    const { register, checked, setChecked, checkboxes } = props
    const { specification, id } = register
    const [attempts, setAttempts] = useState(register.lastGetAttempts)
    const optional = !!specification?.optional
    const failedGet = attempts > 2
    const labelText = `${specification?.name || register.id}${optional ? "?" : ""
        }`
    const humanValue = useRegisterHumanValue(register, { visible: true })
    const handleClick = () => register.sendGetAsync();

    useEffect(
        () =>
            register?.subscribe(GET_ATTEMPT, () => {
                setAttempts(register.lastGetAttempts)
            }),
        [register]
    )

    const handleChecked = c => {
        setChecked(id, c)
    }

    // if register is optional and no data, hide
    if (optional && failedGet && humanValue === undefined) return <></>

    return (
        <StyledTreeItem
            nodeId={id}
            labelText={labelText}
            labelInfo={humanValue || (attempts > 0 && `#${attempts}`) || ""}
            kind={specification?.kind || "register"}
            alert={failedGet && !optional && humanValue === undefined && `???`}
            checked={checked?.indexOf(id) > -1}
            onClick={handleClick}
            setChecked={
                checkboxes?.indexOf("register") > -1 &&
                setChecked &&
                handleChecked
            }
        />
    )
}

function EventTreeItem(
    props: { event: JDEvent } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { event, checked, setChecked, checkboxes } = props
    const { specification, id } = event
    const count = useEventCount(event)

    const handleChecked = c => {
        setChecked(id, c)
    }
    return (
        <StyledTreeItem
            nodeId={id}
            labelText={specification?.name || event.id}
            labelInfo={(count || "") + ""}
            kind="event"
            checked={checked?.indexOf(id) > -1}
            setChecked={
                checkboxes?.indexOf("event") > -1 && setChecked && handleChecked
            }
        />
    )
}

export type CheckedMap = { [id: string]: boolean }

export interface JDomTreeViewProps extends StyledTreeViewProps {
    // don't render links to specification
    dashboard?: boolean
    checkboxes?: ("device" | "service" | "register" | "event")[]
    deviceFilter?: (devices: JDDevice) => boolean
    serviceFilter?: (services: JDService) => boolean
    registerFilter?: (register: JDRegister) => boolean
    eventFilter?: (event: JDEvent) => boolean
}

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        margins: {
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(0.5),
        },
    })
)

export default function JDomTreeView(props: JDomTreeViewProps) {
    const {
        defaultExpanded,
        defaultSelected,
        defaultChecked,
        onChecked,
        onToggle,
        onSelect,
        checkboxes,
        dashboard,
        ...other
    } = props
    const classes = useStyles()
    const [expanded, setExpanded] = useState<string[]>(defaultExpanded || [])
    const [selected, setSelected] = useState<string[]>(defaultSelected || [])
    const [checked, setChecked] = useState<string[]>(defaultChecked || [])
    const devices = useDevices({ ignoreSelf: true })

    const handleToggle = (
        event: React.ChangeEvent<unknown>,
        nodeIds: string[]
    ) => {
        setExpanded(nodeIds)
        if (onToggle) onToggle(nodeIds)
    }

    const handleSelect = (
        event: React.ChangeEvent<unknown>,
        nodeIds: string[]
    ) => {
        setSelected(nodeIds)
        if (onSelect) onSelect(nodeIds)
    }
    const handleChecked = (id: string, v: boolean) => {
        const i = checked.indexOf(id)
        if (!v && i > -1) checked.splice(i, 1)
        else if (v && i < 0) checked.push(id)
        setChecked(checked)
        if (onChecked) onChecked(checked)
    }

    return (
        <>
            <ConnectAlert />
            <TreeView
                className={clsx(classes.root, classes.margins)}
                defaultCollapseIcon={<ArrowDropDownIcon />}
                defaultExpandIcon={<ArrowRightIcon />}
                defaultEndIcon={<div style={{ width: 12 }} />}
                expanded={expanded}
                selected={selected}
                onNodeToggle={handleToggle}
                onNodeSelect={handleSelect}
            >
                {devices?.map(device => (
                    <DeviceTreeItem
                        key={device.id}
                        device={device}
                        checked={checked}
                        setChecked={handleChecked}
                        checkboxes={checkboxes}
                        expanded={expanded}
                        selected={selected}
                        dashboard={dashboard}
                        {...other}
                    />
                ))}
            </TreeView>
        </>
    )
}
