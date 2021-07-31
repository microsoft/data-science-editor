// This class is meant to be extended by ModelBlock classes that store
//   parameter values and information for different bocks. It copies
//   much of the functionality from ReactInlineField but also includes
//   a <T> object where the value of block parameters are stored.
//   additionally, it includes functions for setting the visibility of
//   this field.

import React, { ReactNode } from "react"
import ReactDOM from "react-dom"
import ReactField from "./ReactField"
import { child } from "../../widgets/svg"
import DarkModeProvider from "../../ui/DarkModeProvider"
import { IdProvider } from "react-use-id-hook"
import JacdacProvider from "../../../jacdac/Provider"
import AppTheme from "../../ui/AppTheme"
import Blockly, { Events } from "blockly"
import { WorkspaceProvider } from "../WorkspaceContext"
import { WebAudioProvider } from "../../ui/WebAudioContext"

export default class ReactParameterField<T> extends ReactField<T> {
    protected container: HTMLDivElement
    protected resizeObserver: ResizeObserver

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options?.value, undefined, options, { width: 0, height: 0 })
    }

    protected createContainer(): HTMLDivElement {
        const c = document.createElement("div")
        c.style.display = "inline-block"
        //c.style.minWidth = "0rem"
        return c
    }

    protected initCustomView() {
        const { width, height } = this.size_
        const fo = child(this.fieldGroup_, "foreignObject", {
            x: 0,
            y: 0,
            width,
            height,
        }) as SVGForeignObjectElement

        this.container = this.createContainer()
        fo.appendChild(this.container)

        this.resizeObserver = new ResizeObserver(
            (entries: ResizeObserverEntry[]) => {
                const entry = entries[0]
                const { contentRect } = entry
                this.size_.width = contentRect.width
                this.size_.height = contentRect.height
                fo.setAttribute("width", this.size_.width + "")
                fo.setAttribute("height", this.size_.height + "")
                this.forceRerender()
                const b = this.sourceBlock_
                if (b?.workspace) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const ev = new (Events.get(Events.BLOCK_MOVE) as any)(b)
                    Events.fire(ev)
                }
            }
        )
        this.resizeObserver.observe(this.container)

        ReactDOM.render(this.renderBlock(), this.container)
        return fo
    }

    rerender() {
        ReactDOM.render(this.renderBlock(), this.container)
    }

    dispose() {
        if (this.container) {
            ReactDOM.unmountComponentAtNode(this.container)
            this.container = undefined
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = undefined
        }
        super.dispose()
    }

    renderField(): ReactNode {
        return <div>not used</div>
    }

    renderInlineField(): ReactNode {
        return null
    }

    renderBlock(): ReactNode {
        return (
            <WorkspaceProvider field={this}>
                <DarkModeProvider fixedDarkMode="dark">
                    <IdProvider>
                        <WebAudioProvider>
                            <JacdacProvider>
                                <AppTheme>{this.renderInlineField()}</AppTheme>
                            </JacdacProvider>
                        </WebAudioProvider>
                    </IdProvider>
                </DarkModeProvider>
            </WorkspaceProvider>
        )
    }

    getText_() {
        return "..."
    }

    // don't bind any mouse event
    bindEvents_() {
        Blockly.Tooltip.bindMouseEvents(this.getClickTarget_())
    }

    areParametersVisible() {
        return true
    }

    setParametersVisible(visible) {
        // override to implement
    }
}
