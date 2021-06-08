/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
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
import { ValueProvider } from "./ValueContext"
import { JDEventSource } from "../../../../jacdac-ts/src/jdom/eventsource"
import { CHANGE } from "../../../../jacdac-ts/src/jdom/constants"
import { WorkspaceProvider } from "../WorkspaceContext"

declare module "blockly" {
    interface Block {
        getColourTertiary(): string
    }
}

export type ReactFieldJSON = any

export const SOURCE_BLOCK_CHANGE = "sourceBlockChange"
export const VALUE_CHANGE = "valueChange"
export const MOUNT = "mount"
export const UNMOUNT = "unmount"

export default class ReactField<T> extends Blockly.Field {
    SERIALIZABLE = true
    public readonly events = new JDEventSource()
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

    // override to support custom view
    protected initCustomView(): SVGElement {
        return null
    }

    // override to update view
    protected updateView() {}

    getText_() {
        return JSON.stringify(this.value)
    }

    toXml(fieldElement: Element) {
        fieldElement.textContent = JSON.stringify(this.value)
        return fieldElement
    }

    fromXml(fieldElement: Element) {
        try {
            const v = JSON.parse(fieldElement.textContent)
            this.value = v
        } catch (e) {
            console.log(e, { text: fieldElement.textContent })
            this.value = undefined
        }
    }

    emitChange() {
        this.events.emit(CHANGE)
    }

    setSourceBlock(block: Blockly.Block) {
        const changed = block !== this.sourceBlock_
        super.setSourceBlock(block)
        if (changed) {
            this.events.emit(SOURCE_BLOCK_CHANGE, block)
            this.emitChange()
        }
    }

    initView() {
        this.view = this.initCustomView()
        if (this.view) this.updateView()
        else super.initView()
    }

    updateSize_() {
        if (!this.view) super.updateSize_()
    }

    doValueUpdate_(newValue: string) {
        const change = this.value_ !== newValue
        if (this.view) {
            this.value_ = newValue
            this.updateView()
        } else super.doValueUpdate_(newValue)
        if (change) {
            this.events.emit(VALUE_CHANGE, this.value)
            this.emitChange()
        }
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
            this.events.emit(MOUNT)
        }, 200)
    }

    hide() {
        Blockly.DropDownDiv.hideIfOwner(this, true)
    }

    dropdownDispose_() {
        // this blows on hot reloads
        try {
            this.events.emit(UNMOUNT)
            ReactDOM.unmountComponentAtNode(this.div_)
        } catch (e) {
            console.error(e)
        }
    }

    render() {
        const onValueChange = (newValue: any) => (this.value = newValue)
        return (
            <WorkspaceProvider field={this}>
                <DarkModeProvider fixedDarkMode={"dark"}>
                    <IdProvider>
                        <JacdacProvider>
                            <AppTheme>
                                <ValueProvider
                                    value={this.value}
                                    onValueChange={onValueChange}
                                >
                                    <Box
                                        m={0.5}
                                        borderRadius={"0.25rem"}
                                        bgcolor="background.paper"
                                    >
                                        {this.renderField()}
                                    </Box>
                                </ValueProvider>
                            </AppTheme>
                        </JacdacProvider>
                    </IdProvider>
                </DarkModeProvider>
            </WorkspaceProvider>
        )
    }

    renderField(): ReactNode {
        return <span>not implemented</span>
    }

    dispose() {
        this.view = undefined
        super.dispose()
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
