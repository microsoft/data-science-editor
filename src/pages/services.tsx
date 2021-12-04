import { Chip, Divider, Grid, InputAdornment, TextField } from "@mui/material"
import React, { useMemo, useState } from "react"
import ServiceSpecificationList from "../components/specification/ServiceSpecificationList"
import { useDebounce } from "use-debounce"
import SearchIcon from "@mui/icons-material/Search"
import ChipList from "../components/ui/ChipList"
import { isSensor, serviceSpecifications } from "../../jacdac-ts/src/jdom/spec"
import { arrayConcatMany, hexNum, unique } from "../../jacdac-ts/src/jdom/utils"
import MakeCodeIcon from "../components/icons/MakeCodeIcon"
import KindIcon from "../components/KindIcon"
import { serviceProviderDefinitionFromServiceClass } from "../../jacdac-ts/src/servers/servers"
import JacdacIcon from "../components/icons/JacdacIcon"
import SpeedIcon from "@mui/icons-material/Speed"
import {
    SERVICE_MIXIN_NODE_NAME,
    VIRTUAL_DEVICE_NODE_NAME,
} from "../../jacdac-ts/src/jdom/constants"
import { useId } from "react-use-id-hook"
import { Link } from "gatsby-theme-material-ui"
import { resolveMakecodeServiceFromClassIdentifier } from "../components/makecode/services"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { isMixinService } from "../../jacdac-ts/jacdac-spec/spectool/jdutils"
import useDeviceCatalog from "../components/devices/useDeviceCatalog"

interface ServiceFilter {
    query: string
    tag?: string
    sensors?: boolean
    makeCode?: boolean
    mixin?: boolean
    simulators?: boolean
    devices?: boolean
    test?: boolean
}

function FilterChip(props: {
    label: string
    value: boolean
    icon?: JSX.Element
    onClick: () => void
}) {
    const { label, value, icon, onClick } = props
    const descr = value
        ? `Disable ${label} filter`
        : `Filter by ${label} support`
    return (
        <Chip
            label={label}
            aria-label={descr}
            title={descr}
            icon={icon}
            variant={value ? undefined : "outlined"}
            color={value ? "secondary" : undefined}
            onClick={onClick}
        />
    )
}

export default function ServiceCatalog() {
    const [filter, setFilter] = useState<ServiceFilter>({
        query: "",
    })
    const [deboundedFilter] = useDebounce(filter, 200)
    const { query, tag, makeCode, mixin, simulators, devices, sensors, test } =
        filter
    const deviceCatalog = useDeviceCatalog()
    const searchId = useId()
    const allTags = useMemo(
        () =>
            unique(
                arrayConcatMany(
                    serviceSpecifications().map(srv => [srv.group, ...srv.tags])
                ).filter(t => !!t)
            ),
        []
    )
    const services = useMemo(() => {
        const m = query.toLowerCase().trim()
        let r = serviceSpecifications()
        if (m) {
            const filter = (s: string) => s?.toLowerCase().indexOf(m) > -1
            r = r.filter(
                srv =>
                    filter(srv.name) ||
                    filter(srv.notes["short"]) ||
                    m.indexOf(srv.classIdentifier.toString()) > -1 ||
                    m.indexOf(srv.classIdentifier.toString(16)) > -1
            )
        }
        if (tag) {
            r = r.filter(srv => srv.group === tag || srv.tags.indexOf(tag) > -1)
        }
        if (makeCode)
            r = r.filter(
                srv =>
                    !!resolveMakecodeServiceFromClassIdentifier(
                        srv.classIdentifier
                    )
            )
        if (mixin) r = r.filter(srv => isMixinService(srv.classIdentifier))
        if (simulators)
            r = r.filter(
                srv =>
                    !!serviceProviderDefinitionFromServiceClass(
                        srv.classIdentifier
                    )
            )
        if (devices)
            r = r.filter(
                srv =>
                    !!deviceCatalog.specificationsForService(
                        srv.classIdentifier
                    )?.length
            )
        if (sensors) r = r.filter(srv => isSensor(srv))
        return r
    }, [deboundedFilter])
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter({
            ...filter,
            query: event.target.value,
        })
    }
    const handleTagClick = (t: string) => () => {
        setFilter({ ...filter, tag: tag === t ? "" : t })
    }
    const handleMakeCodeClick = () =>
        setFilter({ ...filter, makeCode: !makeCode })
    const handleMixinClick = () => setFilter({ ...filter, mixin: !mixin })
    const handleTestClick = () => setFilter({ ...filter, test: !test })
    const handleSimulatorClick = () =>
        setFilter({ ...filter, simulators: !simulators })
    const handleDevicesClick = () => setFilter({ ...filter, devices: !devices })
    const handleSensorsClick = () => setFilter({ ...filter, sensors: !sensors })

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField
                        id={searchId}
                        margin="normal"
                        type="search"
                        variant="outlined"
                        label="Search services"
                        aria-label="Search services"
                        fullWidth={true}
                        value={query}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ChipList>
                        {allTags.map(t => (
                            <FilterChip
                                key={t}
                                label={t}
                                onClick={handleTagClick(t)}
                                value={tag === t}
                            />
                        ))}
                        <Divider orientation="vertical" flexItem />
                        <FilterChip
                            label="Sensors"
                            icon={<SpeedIcon />}
                            value={sensors}
                            onClick={handleSensorsClick}
                        />
                        <FilterChip
                            label="Simulator"
                            icon={<KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />}
                            value={simulators}
                            onClick={handleSimulatorClick}
                        />
                        <FilterChip
                            label="Devices"
                            icon={<JacdacIcon />}
                            onClick={handleDevicesClick}
                            value={devices}
                        />
                        <FilterChip
                            label="Mixin"
                            icon={<KindIcon kind={SERVICE_MIXIN_NODE_NAME} />}
                            value={mixin}
                            onClick={handleMixinClick}
                        />
                        <FilterChip
                            label="MakeCode"
                            icon={<MakeCodeIcon />}
                            value={makeCode}
                            onClick={handleMakeCodeClick}
                        />
                        <FilterChip
                            label="Test"
                            icon={<CheckCircleIcon />}
                            value={test}
                            onClick={handleTestClick}
                        />
                    </ChipList>
                </Grid>
                {!services.length && (
                    <Grid item>
                        There are no services matching this request.
                    </Grid>
                )}
                <Grid item xs={12}>
                    <ServiceSpecificationList
                        title="Stable"
                        status={["stable"]}
                        infrastructure={false}
                        services={services}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ServiceSpecificationList
                        title="Experimental"
                        status={["experimental"]}
                        infrastructure={false}
                        services={services}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ServiceSpecificationList
                        title="Jacdac"
                        infrastructure={true}
                        services={services}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ServiceSpecificationList
                        title="Deprecated"
                        status={["deprecated"]}
                        infrastructure={false}
                        services={services}
                    />
                </Grid>
            </Grid>
            <h2>See also</h2>
            <p>
                Known services are specified in
                <Link href="https://github.com/microsoft/jacdac/tree/main/services">
                    https://github.com/microsoft/jacdac/tree/main/services
                </Link>
                . Use the{" "}
                <Link href="/tools/service-editor/">
                    Service Specification Editor
                </Link>{" "}
                and send us a pull request to register your own service.
            </p>
            <ul>
                <li>
                    <Link to="/devices/">Devices</Link>
                </li>
                <li>
                    <Link to="/tools/service-editor/">
                        Service Specification Editor
                    </Link>
                </li>
            </ul>
        </>
    )
}
