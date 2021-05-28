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

export default function ReactFieldProvider(props: {
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

export class ReactField<T> extends Blockly.Field {
    SERIALIZABLE = true
    protected div_: Element

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(value: string, validator?: any, options?: any) {
        super(value, validator, options)
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

    onMount() {}

    onUnmount() {}

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
                                <Box m={1}>{this.renderField()}</Box>
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
