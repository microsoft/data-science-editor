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

export default class ReactInlineField<T = unknown> extends ReactField<T> {
    protected container: HTMLDivElement
    protected resizeObserver: ResizeObserver

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options?.value, undefined, options, { width: 1, height: 1 })
    }

    protected createContainer(): HTMLDivElement {
        const c = document.createElement("div")
        c.style.display = "inline-block"
        c.style.minWidth = "14rem"
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
}
