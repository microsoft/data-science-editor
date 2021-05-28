/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState } from "react"
import ReactDOM from "react-dom"
import Blockly from "blockly"
import JacdacProvider from "../../../jacdac/Provider"
import { ReactNode } from "react"
import { IdProvider } from "react-use-id-hook"
import DarkModeProvider from "../../ui/DarkModeProvider"
import AppTheme from "../../ui/AppTheme"
import { Box } from "@material-ui/core"
import { BlockDefinition } from "../toolbox"
import { assert } from "../../../../jacdac-ts/src/jdom/utils"

declare module "blockly" {
    interface Block {
        getColourTertiary(): string
    }
}

export interface ReactFieldContextProps<T = any> {
    value: T
    onValueChange: (value: T) => void
}

export const ReactFieldContext = createContext<ReactFieldContextProps>({
    value: undefined,
    onValueChange: undefined,
})
ReactFieldContext.displayName = "ReactField"

export function ReactFieldProvider(props: {
    value: any
    onValueChange: (newValue: any) => any
    children: ReactNode
}) {
    const {
        children,
        value: initialValue,
        onValueChange: onFieldValueChange,
    } = props
    const [value, setValue] = useState<any>(initialValue)
    const onValueChange = (newValue: any) => {
        setValue(newValue)
        onFieldValueChange(newValue)
    }
    return (
        <ReactFieldContext.Provider value={{ value, onValueChange }}>
            {children}
        </ReactFieldContext.Provider>
    )
}

export type ReactFieldJSON = any

export default class ReactField<T> extends Blockly.Field {
    SERIALIZABLE = true
    protected div_: Element
    protected view: SVGElement

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(
        value: string,
        validator?: any,
        options?: any,
        size?: { width: number; height: number }
    ) {
        super(value, validator, options)
        if (size) this.size_ = new Blockly.utils.Size(size.width, size.height)
    }

    get defaultValue(): T {
        return {} as T
    }

    get value(): T {
        try {
            const v = JSON.parse(this.getValue())
            return (v || this.defaultValue) as T
        } catch (e) {
            console.warn(e)
            return this.defaultValue
        }
    }

    set value(v: T) {
        this.setValue(JSON.stringify(v))
    }

    // override to listen for mounting events
    onMount() {}

    // override to listen for unmounting
    onUnmount() {}

    // override to support custom view
    protected initCustomView(): SVGElement {
        return null
    }

    // override to update view
    protected updateView() {}

    getText_() {
        return JSON.stringify(this.value)
    }

    fromXml(fieldElement: Element) {
        try {
            const v = JSON.parse(fieldElement.textContent)
            this.value = v
        } catch (e) {
            console.warn(e)
            this.value = undefined
        }
    }

    setSourceBlock(block: Blockly.Block) {
        super.setSourceBlock(block)
        this.onSourceBlockChanged()
    }

    onSourceBlockChanged() {}

    initView() {
        this.view = this.initCustomView()
        if (this.view) this.updateView()
        else super.initView()
    }

    updateSize_() {
        if (!this.view) super.updateSize_()
    }

    doValueUpdate_(newValue: string) {
        if (this.view) {
            this.value_ = newValue
            this.updateView()
        } else super.doValueUpdate_(newValue)
    }

    showEditor_() {
        this.div_ = Blockly.DropDownDiv.getContentDiv()
        ReactDOM.render(this.render(), this.div_)
        const border = this.sourceBlock_.getColourTertiary()
        Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), border)

        // the div_ size has not been computed yet, so let the browse handle this
        setTimeout(() => {
            Blockly.DropDownDiv.showPositionedByField(
                this,
                this.dropdownDispose_.bind(this)
            )
            this.onMount()
        }, 200)
    }

    hide() {
        Blockly.DropDownDiv.hideIfOwner(this, true)
    }

    dropdownDispose_() {
        // this blows on hot reloads
        try {
            this.onUnmount()
            ReactDOM.unmountComponentAtNode(this.div_)
        } catch (e) {
            console.error(e)
        }
    }

    render() {
        const onValueChange = (newValue: any) => (this.value = newValue)
        return (
            <ReactFieldProvider
                value={this.value}
                onValueChange={onValueChange}
            >
                <DarkModeProvider>
                    <IdProvider>
                        <JacdacProvider>
                            <AppTheme>
                                <Box
                                    m={0.5}
                                    borderRadius={"0.25rem"}
                                    bgcolor="background.paper"
                                >
                                    {this.renderField()}
                                </Box>
                            </AppTheme>
                        </JacdacProvider>
                    </IdProvider>
                </DarkModeProvider>
            </ReactFieldProvider>
        )
    }

    renderField(): ReactNode {
        return <span>not implemented</span>
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toShadowDefinition(fieldType: any): BlockDefinition {
    assert(!!fieldType.KEY)
    const type = fieldType.KEY + "_shadow"
    return {
        kind: "block",
        type,
        message0: `%1`,
        args0: [
            {
                type: fieldType.KEY,
                name: "value",
            },
        ],
        style: "math_blocks",
        output: "Number",
        template: "shadow",
    }
}
