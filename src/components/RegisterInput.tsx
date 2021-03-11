import { Box, Typography } from "@material-ui/core"
import DeviceName from "./devices/DeviceName"
import Alert from "./ui/Alert"
import React, { useContext, useEffect, useState } from "react"
// tslint:disable-next-line: no-submodule-imports
import { JDRegister } from "../../jacdac-ts/src/jdom/register"
import { REPORT_UPDATE, SystemReg } from "../../jacdac-ts/src/jdom/constants"
import AppContext from "./AppContext"
import MembersInput from "./fields/MembersInput"
import RegisterTrend from "./RegisterTrend"
import IconButtonWithProgress from "./ui/IconButtonWithProgress"
import useRegisterHost from "./hooks/useRegisterHost"
import useReadingAuxilliaryValue from "./hooks/useReadingAuxilliaryValue"

export type RegisterInputVariant = "widget" | ""

export default function RegisterInput(props: {
    register: JDRegister
    showDeviceName?: boolean
    showServiceName?: boolean
    showRegisterName?: boolean
    hideMissingValues?: boolean
    showTrend?: boolean
    showDataType?: boolean
    variant?: RegisterInputVariant
    off?: boolean
    toggleOff?: () => void
}) {
    const {
        register,
        showRegisterName,
        showDeviceName,
        showServiceName,
        hideMissingValues,
        showTrend,
        showDataType,
        variant,
        off,
        toggleOff,
    } = props
    const { service, specification } = register
    const { device } = service
    const { fields } = register
    const { setError: setAppError } = useContext(AppContext)
    const [working, setWorking] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [args, setArgs] = useState<any[]>(register.unpackedValue || [])
    const host = useRegisterHost(register)
    const hasSet =
        specification.kind === "rw" || (host && specification.kind !== "const")
    const hasData = !!register.data
    const color = hasSet ? "secondary" : "primary"
    const minReading = useReadingAuxilliaryValue(register, SystemReg.MinReading)
    const maxReading = useReadingAuxilliaryValue(register, SystemReg.MaxReading)
    const readingError = useReadingAuxilliaryValue(
        register,
        SystemReg.ReadingError
    )
    const resolution = useReadingAuxilliaryValue(
        register,
        SystemReg.ReadingResolution
    )

    useEffect(
        () =>
            register.subscribe(REPORT_UPDATE, () => {
                const vs = register.unpackedValue
                if (vs !== undefined) setArgs(vs)
            }),
        [register]
    )
    const handleRefresh = () => {
        register.refresh(true)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendArgs = async (values: any[]) => {
        if (working) return
        try {
            setWorking(true)
            if (host) {
                host.setValues(values)
                await register.refresh()
            } else
                await register.sendSetPackedAsync(
                    specification.packFormat,
                    values,
                    true
                )
        } catch (e) {
            setAppError(e)
        } finally {
            setWorking(false)
        }
    }

    if (!specification)
        return (
            <Alert severity="error">{`Unknown member ${register.service}:${register.code}`}</Alert>
        )

    if (!fields.length) return null // nothing to see here

    if (hideMissingValues && !hasData) return null

    const serviceName = register.service.name
        .toLocaleLowerCase()
        .replace(/_/g, " ")
    const registerName = specification.name.replace(/_/g, " ")
    return (
        <>
            {showDeviceName && (
                <Typography component="span" key="devicenamename">
                    <DeviceName device={device} />/
                </Typography>
            )}
            {showServiceName && specification && (
                <Typography
                    variant="caption"
                    key="servicename"
                    aria-label={serviceName}
                >
                    {serviceName}
                </Typography>
            )}
            {showRegisterName && specification && serviceName !== registerName && (
                <Typography
                    variant="caption"
                    key="registername"
                    aria-label={registerName}
                >
                    {" " + registerName}
                </Typography>
            )}
            {!hasData && (
                <Box>
                    <IconButtonWithProgress
                        title="refresh"
                        indeterminate={true}
                        onClick={handleRefresh}
                    />
                </Box>
            )}
            {showTrend && hasData && (
                <RegisterTrend register={register} mini={false} horizon={24} />
            )}
            {hasData && (
                <MembersInput
                    color={color}
                    serviceSpecification={service.specification}
                    serviceMemberSpecification={specification}
                    specifications={fields.map(f => f.specification)}
                    values={args}
                    setValues={hasSet && sendArgs}
                    showDataType={showDataType}
                    variant={variant}
                    min={minReading}
                    max={maxReading}
                    resolution={resolution}
                    error={readingError}
                    off={off}
                    toggleOff={toggleOff}
                />
            )}
        </>
    )
}
