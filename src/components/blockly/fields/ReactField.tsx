/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { createRoot } from "react-dom/client"
import Blockly from "blockly"
import { ReactNode } from "react"
import AppTheme from "../../shell/AppTheme"
import { Box } from "@mui/material"
import { BlockDefinition } from "../toolbox"
import { ValueProvider } from "./ValueContext"
import {
    BlockServices,
    BlockWithServices,
    FieldWithServices,
    WorkspaceProvider,
} from "../WorkspaceContext"
import { ReactFieldBase } from "./ReactFieldBase"
import { SnackbarProvider } from "notistack"
import { DarkModeProvider } from "../../shell/DarkModeContext"
import { JDEventSource } from "../../dom/eventsource"
import { CHANGE } from "../../dom/constants"

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

export default class ReactField<T> extends ReactFieldBase<T> {
    SERIALIZABLE = true
    public readonly events = new JDEventSource()
    protected div_: Element
    // React root
    private root_: any
    protected view: SVGElement
    protected darkMode: "light" | "dark" = "dark"

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
        if (changed && !block?.isInsertionMarker()) {
            const bs = block as unknown as BlockWithServices
            if (!bs.jacdacServices) {
                bs.jacdacServices = new BlockServices()
                bs.inputList?.forEach(i =>
                    i.fieldRow?.forEach(f =>
                        (
                            f as unknown as FieldWithServices
                        ).notifyServicesChanged?.()
                    )
                )
            }
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
        this.root_ = createRoot(this.div_)
        this.root_.render(this.render())
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
            this.root_?.unmount()
            this.root_ = undefined
        } catch (e) {
            console.error(e)
        }
    }

    render() {
        const onValueChange = (newValue: any) => (this.value = newValue)
        return (
            <WorkspaceProvider field={this}>
                <SnackbarProvider maxSnack={1} dense={true}>
                    <DarkModeProvider fixedDarkMode={this.darkMode}>
                        <AppTheme>
                            <ValueProvider
                                value={this.value}
                                onValueChange={onValueChange}
                            >
                                <Box
                                    m={0.5}
                                    borderRadius="0.25rempx"
                                    bgcolor="background.paper"
                                >
                                    {this.renderField()}
                                </Box>
                            </ValueProvider>
                        </AppTheme>
                    </DarkModeProvider>
                </SnackbarProvider>
            </WorkspaceProvider>
        )
    }

    renderField(): ReactNode {
        return <span>not implemented</span>
    }

    dispose() {
        this.view = undefined
        this.root_?.unmount()
        this.root_ = undefined
        super.dispose()
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toShadowDefinition(fieldType: any): BlockDefinition {
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
    }
}
