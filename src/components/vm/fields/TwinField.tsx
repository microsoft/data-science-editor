import React, { PointerEvent, ReactNode, useContext } from "react"
import ReactDOM from "react-dom"
import ReactField, { ReactFieldJSON } from "./ReactField"
import { child } from "../../widgets/svg"
import DarkModeProvider from "../../ui/DarkModeProvider"
import { IdProvider } from "react-use-id-hook"
import JacdacProvider from "../../../jacdac/Provider"
import AppTheme from "../../ui/AppTheme"
import { Button, Grid } from "@material-ui/core"
import useServices from "../../hooks/useServices"
import DashboardServiceWidget from "../../dashboard/DashboardServiceWidget"
import AddIcon from "@material-ui/icons/Add"
import { startServiceProviderFromServiceClass } from "../../../../jacdac-ts/src/servers/servers"
import JacdacContext, { JacdacContextProps } from "../../../jacdac/Context"
import Alert from "../../ui/Alert"
import Blockly from "blockly"
import { serviceSpecificationFromClassIdentifier } from "../../../../jacdac-ts/src/jdom/spec"

function DashboardServiceFieldWidget(props: { serviceClass: number }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { serviceClass } = props
    const specification = serviceSpecificationFromClassIdentifier(serviceClass)
    const services = useServices({ ignoreSelf: true, serviceClass })
    const service = services?.[0]
    const handleStartSimulator = () =>
        startServiceProviderFromServiceClass(bus, serviceClass)
    const onPointerStopPropagation = (event: PointerEvent<HTMLDivElement>) => {
        // make sure blockly does not handle drags when interacting with UI
        event.stopPropagation()
    }

    return (
        <Grid
            container
            alignItems="center"
            alignContent="center"
            justify="center"
            spacing={1}
        >
            {service ? (
                <Grid item>
                    <div
                        style={{ cursor: "inherit" }}
                        onPointerDown={onPointerStopPropagation}
                        onPointerUp={onPointerStopPropagation}
                        onPointerMove={onPointerStopPropagation}
                    >
                        <DashboardServiceWidget
                            service={service}
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
                    <Button
                        variant="contained"
                        color="default"
                        startIcon={<AddIcon />}
                        onClick={handleStartSimulator}
                    >
                        start simulator
                    </Button>
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
            <DarkModeProvider fixedDarkMode="dark">
                <IdProvider>
                    <JacdacProvider>
                        <AppTheme>
                            <DashboardServiceFieldWidget
                                serviceClass={this.serviceClass}
                            />
                        </AppTheme>
                    </JacdacProvider>
                </IdProvider>
            </DarkModeProvider>
        )
    }

    // don't bind any mouse event
    bindEvents_() {
        Blockly.Tooltip.bindMouseEvents(this.getClickTarget_())
    }

    // track current role
    onSourceBlockChanged() {
        this.updateRole()
    }

    updateRole() {
        const source = this.getSourceBlock()
        const field = source?.inputList[0].fieldRow[0] as Blockly.FieldVariable
        // force model geneartion
        const xml = document.createElement("xml")
        field?.toXml(xml)
        const role = field?.getVariable()
        console.log("updated role", { source, field, role })
    }
}
