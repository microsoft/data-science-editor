import { Grid } from "@mui/material"
import React from "react"
import { PackedSimpleValue } from "../../../jacdac-ts/src/jdom/pack"
import { RegisterInputVariant } from "../RegisterInput"
import MemberInput from "./MemberInput"

export default function MembersInput(props: {
    serviceSpecification: jdspec.ServiceSpec
    serviceMemberSpecification?: jdspec.PacketInfo
    specifications: jdspec.PacketMember[]
    values?: PackedSimpleValue[]
    setValues?: (values: PackedSimpleValue[]) => void
    showDataType?: boolean
    color?: "primary" | "secondary"
    variant?: RegisterInputVariant
    min?: number[]
    max?: number[]
    resolution?: number[]
    error?: number[]
    off?: boolean
    toggleOff?: () => void
}) {
    const {
        serviceSpecification,
        serviceMemberSpecification,
        specifications,
        values,
        setValues,
        showDataType,
        color,
        variant,
        min,
        max,
        resolution,
        error,
        off,
        toggleOff,
    } = props
    const setValue = (index: number) => (value: PackedSimpleValue) => {
        const c = values.slice(0)
        c[index] = value
        setValues(c)
    }

    return (
        <Grid container spacing={1}>
            {specifications.map((field, fieldi) => {
                const value = values?.[fieldi]
                return (
                    <Grid item key={fieldi} xs={12}>
                        <MemberInput
                            serviceSpecification={serviceSpecification}
                            serviceMemberSpecification={
                                serviceMemberSpecification
                            }
                            specification={field}
                            showDataType={showDataType}
                            value={value}
                            color={color}
                            setValue={values && setValues && setValue(fieldi)}
                            variant={variant}
                            min={min?.[fieldi]}
                            max={max?.[fieldi]}
                            resolution={resolution?.[fieldi]}
                            error={error?.[fieldi]}
                            off={off}
                            toggleOff={toggleOff}
                        />
                    </Grid>
                )
            })}
        </Grid>
    )
}
