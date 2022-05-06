import React, { ReactNode } from "react"
import { createRoot } from "react-dom/client"
import ReactField from "./ReactField"
import { child } from "../../widgets/svg"
import DarkModeProvider from "../../ui/DarkModeProvider"
import JacdacProvider from "../../../jacdac/Provider"
import AppTheme from "../../ui/AppTheme"
import Blockly, { Events } from "blockly"
import { WorkspaceProvider } from "../WorkspaceContext"
import { WebAudioProvider } from "../../ui/WebAudioContext"
import { SnackbarProvider } from "notistack"

export default class ReactInlineField<T = unknown> extends ReactField<T> {
    protected container: HTMLDivElement
    protected resizeObserver: ResizeObserver
    // React root
    private inlineRoot_: any

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
                this.size_.width = Math.max(16, contentRect.width)
                this.size_.height = Math.max(16, contentRect.height)
                fo.setAttribute("width", this.size_.width + "")
                fo.setAttribute("height", this.size_.height + "")
                fo.setAttribute("color", "#fff")
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

        this.inlineRoot_ = createRoot(this.container)
        this.inlineRoot_.render(this.renderBlock())
        return fo
    }

    dispose() {
        if (this.container) {
            this.inlineRoot_?.unmount()
            this.container = undefined
            this.inlineRoot_ = undefined
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
                <SnackbarProvider maxSnack={1} dense={true}>
                    <DarkModeProvider fixedDarkMode="dark">
                        <WebAudioProvider>
                            <JacdacProvider>
                                <AppTheme>{this.renderInlineField()}</AppTheme>
                            </JacdacProvider>
                        </WebAudioProvider>
                    </DarkModeProvider>
                </SnackbarProvider>
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
