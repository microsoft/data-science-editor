import React, { PointerEvent, ReactNode, useContext } from "react"
import ReactDOM from "react-dom"
import ReactField, { ReactFieldJSON } from "./ReactField"
import { child } from "../../widgets/svg"
import DarkModeProvider from "../../ui/DarkModeProvider"
import { IdProvider } from "react-use-id-hook"
import JacdacProvider from "../../../jacdac/Provider"
import AppTheme from "../../ui/AppTheme"
import { Button, Grid } from "@material-ui/core"
import DashboardServiceWidget from "../../dashboard/DashboardServiceWidget"
import AddIcon from "@material-ui/icons/Add"
import { startServiceProviderFromServiceClass } from "../../../../jacdac-ts/src/servers/servers"
import JacdacContext, { JacdacContextProps } from "../../../jacdac/Context"
import Alert from "../../ui/Alert"
import Blockly from "blockly"
import { serviceSpecificationFromClassIdentifier } from "../../../../jacdac-ts/src/jdom/spec"
import WorkspaceContext, { WorkspaceProvider } from "../WorkspaceContext"

function TwinWidget(props: { serviceClass: number }) {
    const { serviceClass } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { roleService, flyout } = useContext(WorkspaceContext)
    const specification = serviceSpecificationFromClassIdentifier(serviceClass)
    const handleStartSimulator = () =>
        startServiceProviderFromServiceClass(bus, serviceClass)
    const onPointerStopPropagation = (event: PointerEvent<HTMLDivElement>) => {
        // make sure blockly does not handle drags when interacting with UI
        event.stopPropagation()
    }

    console.log(`twin`, { roleService, flyout })

    return (
        <Grid
            container
            alignItems="center"
            alignContent="center"
            justify="center"
            spacing={1}
        >
            {roleService ? (
                <Grid item>
                    <div
                        style={{ cursor: "inherit" }}
                        onPointerDown={onPointerStopPropagation}
                        onPointerUp={onPointerStopPropagation}
                        onPointerMove={onPointerStopPropagation}
                    >
                        <DashboardServiceWidget
                            service={roleService}
                            visible={true}
                            variant="icon"
                        />
                    </div>
                </Grid>
            ) : (
                <Grid item>
                    <Alert severity="info">
                        No {specification?.name || "service"}...
                    </Alert>
                    {!flyout && (
                        <Button
                            variant="contained"
                            color="default"
                            startIcon={<AddIcon />}
                            onClick={handleStartSimulator}
                        >
                            start simulator
                        </Button>
                    )}
                </Grid>
            )}
        </Grid>
    )
}

export default class TwinField extends ReactField<number> {
    static KEY = "jacdac_field_twin"
    static EDITABLE = false
    protected serviceClass: number
    protected container: HTMLDivElement
    protected resizeObserver: ResizeObserver

    static fromJson(options: ReactFieldJSON) {
        return new TwinField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options?.value, undefined, options, { width: 240, height: 160 })
        this.serviceClass = options.serviceClass
    }

    protected initCustomView() {
        const { width, height } = this.size_
        const fo = child(this.fieldGroup_, "foreignObject", {
            x: 0,
            y: 0,
            width,
            height,
        }) as SVGForeignObjectElement

        this.container = document.createElement("div")
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
        return <div>field</div>
    }

    renderBlock(): ReactNode {
        return (
            <WorkspaceProvider field={this}>
                <DarkModeProvider fixedDarkMode="dark">
                    <IdProvider>
                        <JacdacProvider>
                            <AppTheme>
                                <TwinWidget serviceClass={this.serviceClass} />
                            </AppTheme>
                        </JacdacProvider>
                    </IdProvider>
                </DarkModeProvider>
            </WorkspaceProvider>
        )
    }

    // don't bind any mouse event
    bindEvents_() {
        Blockly.Tooltip.bindMouseEvents(this.getClickTarget_())
    }
}
