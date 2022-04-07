import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material"
import React, { ChangeEvent, ReactNode } from "react"
import { useId } from "react"

export default function SelectWithLabel(props: {
    required?: boolean
    label?: string
    disabled?: boolean
    error?: string
    value?: string
    placeholder?: string
    type?: string
    fullWidth?: boolean
    onChange?: (ev: SelectChangeEvent<unknown>) => void
    onClose?: (ev: ChangeEvent<unknown>) => void
    helperText?: string
    children?: ReactNode
    none?: ReactNode
}) {
    const {
        label,
        fullWidth,
        required,
        disabled,
        value,
        error,
        placeholder,
        onChange,
        onClose,
        children,
        helperText,
        type,
        none,
    } = props
    const id = useId()
    const labelId = id + "-label"
    const descrId = id + "-descr"
    const hasDescr = !!helperText || !!error

    return (
        <FormControl fullWidth={fullWidth} variant="outlined">
            <InputLabel id={labelId} key="label">
                {required ? `${label} *` : label}
            </InputLabel>
            <Select
                id={id}
                disabled={disabled}
                label={label}
                value={value}
                error={!!error}
                fullWidth={true}
                placeholder={placeholder}
                type={type}
                labelId={labelId}
                aria-describedby={hasDescr ? descrId : undefined}
                onChange={onChange}
                onClose={onClose}
            >
                {none !== undefined && (
                    <MenuItem key={"none"} value={""}>
                        {none}
                    </MenuItem>
                )}
                {children}
            </Select>
            {hasDescr && (
                <FormHelperText id={descrId}>
                    {error || helperText}
                </FormHelperText>
            )}
        </FormControl>
    )
}
