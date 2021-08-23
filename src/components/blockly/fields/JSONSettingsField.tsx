/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import React, { lazy, ReactNode, useEffect, useState } from "react"
import ReactField, { ReactFieldJSON, UNMOUNT } from "./ReactField"
import type { JSONSchema4 } from "json-schema"
import Suspense from "../../ui/Suspense"
import { InputDefinition } from "../toolbox"
import { assert } from "../../../../jacdac-ts/src/jdom/utils"
import JDEventSource from "../../../../jacdac-ts/src/jdom/eventsource"
const JSONSchemaForm = lazy(() => import("../../ui/JSONSchemaForm"))

export interface JSONSettingsOptions extends ReactFieldJSON {
    schema?: JSONSchema4
}

export interface JSONSettingsInputDefinition extends InputDefinition {
    type: "jacdac_field_json_settings"
    schema: JSONSchema4
}

function JSONSettingsWidget(props: {
    schema: JSONSchema4
    value: any
    events: JDEventSource
    setValue: (newValue: any) => void
}) {
    const { schema, value, setValue, events } = props
    const [editValue, setEditValue] = useState(value)

    useEffect(
        () => events.subscribe(UNMOUNT, () => setValue(editValue)),
        [editValue]
    )

    return (
        <div
            style={{
                maxWidth: "22rem",
                minHeight: "20rem",
                padding: "0.5rem",
            }}
        >
            <Suspense>
                <JSONSchemaForm
                    schema={schema}
                    value={editValue}
                    setValue={setEditValue}
                />
            </Suspense>
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class JSONSettingsField extends ReactField<ReactFieldJSON> {
    static KEY = "jacdac_field_json_settings"
    SERIALIZABLE = true
    schema: JSONSchema4

    static fromJson(options: ReactFieldJSON) {
        return new JSONSettingsField(options?.value, undefined, options)
    }

    // the first argument is a dummy and never used
    constructor(value: string, validator?: any, options?: JSONSettingsOptions) {
        super(value, validator, options)
        this.schema = options?.schema || {}
        this.darkMode = "light"
        assert(!!this.schema, "schema missing")
    }

    protected initCustomView(): SVGElement {
        const group = this.fieldGroup_
        group.classList.add("blocklyFieldButton")
        return undefined
    }

    get defaultValue() {
        return {}
    }

    getText_() {
        return "⚙️"
    }

    renderField(): ReactNode {
        const { schema, value = {}, events } = this
        const setValue = (v: any) => (this.value = v)
        return (
            <JSONSettingsWidget
                schema={schema}
                value={value}
                events={events}
                setValue={setValue}
            />
        )
    }
}
