/* eslint-disable @typescript-eslint/ban-types */
import React from "react"
import type { JSONSchema4 } from "json-schema"
import { Grid, TextField } from "@material-ui/core"
import SwitchWithLabel from "./SwitchWithLabel"
import { useId } from "react-use-id-hook"
import GridHeader from "./GridHeader"

function SchemaForm(props: {
    schema: JSONSchema4
    required?: boolean
    value: object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue: (newValue: any) => void
}) {
    const { schema, required, value, setValue } = props
    const { type, title, description } = schema
    const id = useId()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value || "")
    }

    const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseFloat(event.target.value)
        if (!isNaN(v)) setValue(v)
    }
    const handleIntegerChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const v = parseInt(event.target.value)
        if (!isNaN(v)) setValue(v)
    }
    const handleCheckedChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => {
        setValue(checked)
    }

    switch (type) {
        case "number":
            return (
                <Grid item xs={12}>
                    <TextField
                        id={id}
                        label={title}
                        required={required}
                        helperText={description}
                        variant="outlined"
                        type="number"
                        value={value}
                        fullWidth={true}
                        onChange={handleNumberChange}
                    />
                </Grid>
            )
        case "integer":
            return (
                <Grid item xs={12}>
                    <TextField
                        id={id}
                        label={title}
                        required={required}
                        helperText={description}
                        variant="outlined"
                        type="number"
                        value={value}
                        fullWidth={true}
                        onChange={handleIntegerChange}
                    />
                </Grid>
            )
        case "string":
            return (
                <Grid item xs={12}>
                    <TextField
                        id={id}
                        label={title}
                        required={required}
                        helperText={description}
                        variant="outlined"
                        type="text"
                        value={value}
                        fullWidth={true}
                        onChange={handleChange}
                    />
                </Grid>
            )
        case "boolean":
            return (
                <Grid item xs={12}>
                    <SwitchWithLabel
                        id={id}
                        required={required}
                        label={title}
                        title={description}
                        checked={!!value}
                        onChange={handleCheckedChange}
                    />
                </Grid>
            )
        case "object": {
            const { properties, required } = schema
            return (
                <>
                    {title && <GridHeader title={title} />}
                    <PropertiesForm
                        properties={properties}
                        required={required}
                        value={value}
                        setValue={setValue}
                    />
                </>
            )
        }
    }

    return null
}

function PropertiesForm(props: {
    properties: { [index: string]: JSONSchema4 }
    required: false | string[]
    value: object
    setValue: (newValue: object) => void
}) {
    const { properties, required, value, setValue } = props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSetValue = (key: string, v: any) => (newValue: any) => {
        setValue({ ...(v || {}), [key]: newValue })
    }

    return (
        <>
            {Object.entries(properties).map(([key, schema]) => (
                <SchemaForm
                    key={key}
                    schema={schema}
                    required={required && required.indexOf(key) > -1}
                    value={value?.[key]}
                    setValue={handleSetValue(key, value)}
                />
            ))}
        </>
    )
}

export default function JSONSchemaForm(props: {
    schema: JSONSchema4
    value: object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue: (newValue: any) => void
    className?: string
}) {
    const { schema, value, setValue, className } = props

    return (
        <Grid container spacing={1} className={className}>
            <SchemaForm schema={schema} value={value} setValue={setValue} />
        </Grid>
    )
}
