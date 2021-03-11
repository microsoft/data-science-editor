import React, { useContext, useState } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { Button } from "@material-ui/core"
// tslint:disable-next-line: no-submodule-imports
import { AlertTitle } from "@material-ui/lab"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import InfoIcon from "@material-ui/icons/Info"
import Alert from "../ui/Alert"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import {
    addHost,
    hostDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/hosts/hosts"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { serviceTestFromServiceClass } from "../../../jacdac-ts/src/test/testspec"
import SelectService from "../SelectService"
import ServiceTestRunner from "./ServiceTestRunner"

function Diagnostics(props: { serviceClass: number }) {
    const { serviceClass } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)

    const hostDefinition = hostDefinitionFromServiceClass(serviceClass)
    const handleStartSimulator = () => addHost(bus, hostDefinition.services())

    if (!hostDefinition) return null

    return (
        <Alert severity="info">
            <AlertTitle>Developer zone</AlertTitle>
            <Button variant="outlined" onClick={handleStartSimulator}>
                start simulator
            </Button>
        </Alert>
    )
}

function ServiceTestRunnerSelect(props: {
    serviceClass: number
    onSelect: (service: JDService) => void
}) {
    const { serviceClass, onSelect } = props
    return (
        <>
            <h3>Select a device to test</h3>
            <SelectService serviceClass={serviceClass} onSelect={onSelect} />
        </>
    )
}

export default function ServiceTest(props: {
    serviceSpec: jdspec.ServiceSpec
    serviceTest?: jdtest.ServiceTestSpec
    showStartSimulator?: boolean
}) {
    const {
        serviceSpec,
        showStartSimulator,
        serviceTest = serviceTestFromServiceClass(serviceSpec?.classIdentifier),
    } = props
    const { classIdentifier: serviceClass } = serviceSpec
    const [service, setService] = useState<JDService>(undefined)
    const handleSelect = (service: JDService) => setService(service)
    return (
        <>
            <h1>
                {`${serviceSpec.name} tests`}
                <IconButtonWithTooltip
                    title="go to specification"
                    to={`/services/${serviceSpec.shortId}/`}
                >
                    <InfoIcon />
                </IconButtonWithTooltip>
            </h1>
            {(Flags.diagnostics || showStartSimulator) && (
                <Diagnostics serviceClass={serviceClass} />
            )}
            {!service && (
                <ServiceTestRunnerSelect
                    serviceClass={serviceClass}
                    onSelect={handleSelect}
                />
            )}
            {service && (
                <ServiceTestRunner
                    service={service}
                    serviceTest={serviceTest}
                />
            )}
        </>
    )
}
