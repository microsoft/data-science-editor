import React, { useMemo } from "react"
import { SystemReg } from "../../../jacdac-ts/src/jdom/constants"
import { isRegister } from "../../../jacdac-ts/src/jdom/spec"
import RegisterInput from "../RegisterInput"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import { DashboardServiceProps } from "./DashboardServiceWidget"

const collapsedRegisters = [
    SystemReg.Reading,
    SystemReg.Value,
    SystemReg.Intensity,
]

function ValueWidget(
    props: {
        valueRegister: JDRegister
        intensityRegister: JDRegister
    } & DashboardServiceProps
) {
    const { valueRegister, intensityRegister, controlled, ...others } = props
    const { visible } = others
    const hasIntensityBool =
        intensityRegister?.specification?.fields[0]?.type === "bool"
    const intensity = useRegisterBoolValue(
        hasIntensityBool && intensityRegister,
        others
    )
    const off = hasIntensityBool ? !intensity : undefined
    const toggleOff = async () => {
        await intensityRegister.sendSetBoolAsync(off, true)
    }

    return (
        <RegisterInput
            register={valueRegister}
            variant={"widget"}
            showServiceName={false}
            showRegisterName={false}
            hideMissingValues={true}
            off={off}
            toggleOff={hasIntensityBool ? toggleOff : undefined}
            visible={visible}
            controlled={controlled}
        />
    )
}

function IntensityWidget(
    props: { intensityRegister: JDRegister } & DashboardServiceProps
) {
    const { intensityRegister, controlled, ...others } = props
    const { visible } = others

    const hasIntensityBool =
        intensityRegister?.specification?.fields[0]?.type === "bool"
    const [intensity] = useRegisterUnpackedValue<[number | boolean]>(
        intensityRegister,
        others
    )
    const off = hasIntensityBool ? !intensity : undefined

    return (
        <RegisterInput
            register={intensityRegister}
            variant={"widget"}
            showServiceName={false}
            showRegisterName={false}
            hideMissingValues={true}
            off={off}
            visible={visible}
            controlled={controlled}
        />
    )
}

function DefaultRegisterWidget(
    props: { register: JDRegister } & DashboardServiceProps
) {
    const { register, controlled, ...rest } = props
    if (register.specification.identifier == SystemReg.Value) {
        const intensityRegister = props.service.register(SystemReg.Intensity)
        return (
            <ValueWidget
                valueRegister={register}
                intensityRegister={intensityRegister}
                controlled={controlled}
                {...rest}
            />
        )
    } else if (register.specification.identifier === SystemReg.Intensity)
        return (
            <IntensityWidget
                intensityRegister={register}
                controlled={controlled}
                {...rest}
            />
        )
    else
        return (
            <RegisterInput
                register={register}
                variant={"widget"}
                showServiceName={false}
                showRegisterName={false}
                hideMissingValues={true}
                visible={props.visible}
                controlled={controlled}
            />
        )
}

export default function DashboardServiceDefaultWidget(
    props: DashboardServiceProps
) {
    const { service } = props
    const { specification } = service
    const registers = useMemo(
        () =>
            specification?.packets
                .filter(
                    pkt =>
                        isRegister(pkt) &&
                        collapsedRegisters.indexOf(pkt.identifier) > -1
                )
                // if value, skip bool intensity
                .filter(
                    (pkt, i, pkts) =>
                        !(
                            pkt.identifier === SystemReg.Intensity &&
                            pkt.fields.length == 1 &&
                            pkt.fields[0].type === "bool"
                        ) || !pkts.some(pk => pk.identifier === SystemReg.Value)
                )
                // map
                .map(rspec => service.register(rspec.identifier)),
        [service]
    )

    if (!registers?.length)
        // nothing to see here
        return null

    return (
        <>
            {registers.map(register => (
                <DefaultRegisterWidget
                    key={register.id}
                    register={register}
                    {...props}
                />
            ))}
        </>
    )
}
