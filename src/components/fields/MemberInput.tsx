import React, { useEffect, useState } from "react"
// tslint:disable-next-line: no-submodule-imports
import { FormControlLabel, Slider } from "@material-ui/core"
import { MenuItem, Select, Switch, TextField } from "@material-ui/core"
import {
    flagsToValue,
    prettyMemberUnit,
    prettyUnit,
    valueToFlags,
} from "../../../jacdac-ts/src/jdom/pretty"
import {
    isIntegerType,
    isValueOrIntensity,
    memberValueToString,
    tryParseMemberValue,
} from "../../../jacdac-ts/src/jdom/spec"
import {
    isSet,
    pick,
    roundWithPrecision,
} from "../../../jacdac-ts/src/jdom/utils"
import { RegisterInputVariant } from "../RegisterInput"
import ButtonWidget from "../widgets/ButtonWidget"
import GaugeWidget from "../widgets/GaugeWidget"
import useWidgetSize from "../widgets/useWidgetSize"
import ValueWithUnitWidget from "../widgets/ValueWithUnitWidget"
import useUnitIcon from "../hooks/useUnitIcon"
import { PackedSimpleValue } from "../../../jacdac-ts/src/jdom/pack"
import { useId } from "react-use-id-hook"
import LoadingProgress from "../ui/LoadingProgress"

export default function MemberInput(props: {
    specification: jdspec.PacketMember
    serviceSpecification: jdspec.ServiceSpec
    serviceMemberSpecification: jdspec.PacketInfo
    value: PackedSimpleValue
    setValue?: (v: PackedSimpleValue) => void
    showDataType?: boolean
    color?: "primary" | "secondary"
    variant?: RegisterInputVariant
    min?: number
    max?: number
    resolution?: number
    error?: number
    showLoading?: boolean
    off?: boolean
    toggleOff?: () => void
}) {
    const {
        specification,
        serviceSpecification,
        serviceMemberSpecification,
        value,
        setValue,
        showDataType,
        color,
        variant,
        min,
        max,
        resolution,
        error,
        showLoading,
        off,
        toggleOff,
    } = props
    const {
        typicalMin,
        typicalMax,
        absoluteMin,
        absoluteMax,
        type,
    } = specification
    const enumInfo = serviceSpecification.enums?.[specification.type]
    const disabled = !setValue
    const [errorText, setErrorText] = useState("")
    const [textValue, setTextValue] = useState("")
    const valueString = memberValueToString(value, specification)
    const name =
        specification.name === "_"
            ? serviceMemberSpecification.name
            : specification.name
    const label = name
    const isWidget = variant === "widget"
    const widgetSize = useWidgetSize()
    const unitIcon = useUnitIcon(specification.unit, { "aria-label": label })

    const minValue = pick(
        min,
        typicalMin,
        absoluteMin,
        /^u/.test(type) ? 0 : undefined
    )
    const maxValue = pick(max, typicalMax, absoluteMax)
    const errorValue = error
        ? "±" +
          roundWithPrecision(
              error,
              1 - Math.floor(Math.log10(error))
          ).toLocaleString()
        : undefined
    const unit = prettyUnit(specification.unit)
    const helperText =
        errorText ||
        [prettyMemberUnit(specification, showDataType), errorValue]
            .filter(v => v !== undefined)
            .join(", ")
    const inputId = useId()

    const inputType =
        specification.type === "string" || specification.type === "string0"
            ? "string"
            : specification.isSimpleType || isIntegerType(specification.type)
            ? "number"
            : ""

    // update coming from device
    useEffect(() => {
        setTextValue(valueString)
    }, [valueString])

    const handleChecked = (ev, checked: boolean) => {
        setValue(checked)
    }
    const handleChange = ev => {
        const newValue = ev.target.value
        setTextValue(newValue)
        const r = tryParseMemberValue(newValue, specification)
        if (r.value !== undefined) setValue(r.value)
        setErrorText(r.error)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEnumChange = (event: React.ChangeEvent<{ value: any }>) => {
        const v = enumInfo.isFlags
            ? flagsToValue(event.target.value as number[])
            : (event.target.value as number)
        setValue(v)
    }
    const handleSliderChange = (
        event: unknown,
        newValue: number | number[]
    ) => {
        const v = newValue as number
        setValue(v)
    }
    const percentValueFormat = (value: number) => {
        // avoid super long floats
        return ((value * 100) >> 0) + "%"
    }

    const valueLabelFormat = (value: number) => {
        // avoid super long floats
        return roundWithPrecision(value, 1) + (unit || "")
    }
    const percentValueLabelFormat = (v: number) => {
        return `${Math.round(v * 100)}%`
    }
    const offFormat = () => "off"

    // value hasn't been loaded yet
    if (serviceMemberSpecification.kind !== "command" && value === undefined) {
        if (showLoading) return <LoadingProgress />
        else return null
    }

    //
    if (specification.type === "pipe") {
        return (
            <>
                pipe <code>{specification.name}</code>
            </>
        )
    } else if (specification.type === "bool") {
        if (isWidget && !isValueOrIntensity(serviceMemberSpecification)) {
            return (
                <ButtonWidget
                    label={!isWidget && label}
                    checked={!!value}
                    color={color}
                    size={widgetSize}
                />
            )
        }

        return (
            <FormControlLabel
                control={
                    <Switch
                        checked={!!value}
                        onChange={disabled ? undefined : handleChecked}
                        color={color}
                    />
                }
                label={label}
            />
        )
    } else if (enumInfo !== undefined) {
        return (
            <Select
                aria-label={label}
                disabled={disabled}
                multiple={enumInfo.isFlags}
                value={
                    enumInfo.isFlags
                        ? valueToFlags(enumInfo, value as number)
                        : value
                }
                onChange={handleEnumChange}
            >
                {Object.keys(enumInfo.members).map(n => (
                    <MenuItem key={n} value={enumInfo.members[n]}>
                        {n}
                    </MenuItem>
                ))}
            </Select>
        )
    } else if (specification.unit === "/") {
        const signed = specification.storage < 0
        const min = signed ? -1 : 0
        const max = 1
        const step = resolution !== undefined ? resolution : 0.01
        if (isWidget)
            return (
                <GaugeWidget
                    tabIndex={0}
                    label={label}
                    value={value as number}
                    color={color}
                    variant={signed ? "fountain" : undefined}
                    min={min}
                    max={max}
                    step={step}
                    valueLabel={percentValueLabelFormat}
                    onChange={disabled ? undefined : handleSliderChange}
                    off={off}
                    toggleOff={toggleOff}
                />
            )

        return (
            <Slider
                aria-label={label}
                color={color}
                value={value as number}
                valueLabelFormat={percentValueFormat}
                onChange={disabled ? undefined : handleSliderChange}
                min={min}
                max={max}
                step={step}
                valueLabelDisplay="auto"
            />
        )
    } else if (isSet(minValue) && isSet(maxValue)) {
        const hasTypicalRange = isSet(typicalMin) && isSet(typicalMax)
        let step =
            resolution !== undefined
                ? resolution
                : hasTypicalRange
                ? (specification.typicalMax - specification.typicalMin) / 100
                : (maxValue - minValue) / 100
        if (step === 0 || isNaN(step))
            // edge case
            step = undefined
        const marks =
            hasTypicalRange &&
            (typicalMin !== minValue || typicalMax !== maxValue)
                ? [
                      {
                          value: typicalMin,
                      },
                      {
                          value: typicalMax,
                      },
                  ]
                : undefined
        if (isWidget)
            return (
                <ValueWithUnitWidget
                    tabIndex={0}
                    label={specification.unit}
                    value={value as number}
                    min={minValue}
                    max={maxValue}
                    icon={unitIcon}
                    step={step}
                    secondaryLabel={errorValue}
                    color={color}
                    onChange={disabled ? undefined : handleSliderChange}
                />
            )

        return (
            <Slider
                value={value as number}
                color={color}
                valueLabelFormat={off ? offFormat : valueLabelFormat}
                onChange={disabled ? undefined : handleSliderChange}
                min={minValue}
                max={maxValue}
                step={step}
                marks={marks}
                valueLabelDisplay="auto"
            />
        )
    } else if (specification.type === "bytes") {
        return (
            <TextField
                id={inputId}
                spellCheck={false}
                value={textValue}
                label={label}
                inputProps={{ ["aria-label"]: label }}
                helperText={helperText}
                onChange={disabled ? undefined : handleChange}
                required={value === undefined}
                error={!!errorText}
                type={"text"}
            />
        )
    } else {
        // numbers or string or uintarrays
        if (isWidget)
            // we need min/max to support a slider
            return (
                <ValueWithUnitWidget
                    tabIndex={0}
                    value={roundWithPrecision(value as number, 1)}
                    label={specification.unit}
                    color={color}
                    size={widgetSize}
                />
            )

        return (
            <TextField
                id={inputId}
                spellCheck={false}
                value={textValue}
                label={label}
                inputProps={{ ["aria-label"]: label, readOnly: disabled }}
                helperText={helperText}
                onChange={disabled ? undefined : handleChange}
                required={value === undefined}
                error={!!errorText}
                type={inputType}
            />
        )
    }
}
