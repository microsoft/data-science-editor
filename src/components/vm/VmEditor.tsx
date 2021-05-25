import React, { useContext, useEffect, useRef, useState } from "react"
import { useBlocklyWorkspace } from "react-blockly"
import Blockly from "blockly"
import "@blockly/field-slider"
import "@blockly/block-dynamic-connection"
import Theme from "@blockly/theme-modern"
import DarkTheme from "@blockly/theme-dark"
import { DisableTopBlocks } from "@blockly/disable-top-blocks"
import useToolbox, {
    ButtonDefinition,
    CategoryDefinition,
    scanServices,
} from "./useToolbox"
import BlocklyModalDialogs from "./BlocklyModalDialogs"
import { domToJSON, WorkspaceJSON } from "./jsongenerator"
import DarkModeContext from "../ui/DarkModeContext"
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import workspaceJSONToIT4Program from "./it4generator"
import AppContext from "../AppContext"

export default function VmEditor(props: {
    className?: string
    initialXml?: string
    onXmlChange?: (xml: string) => void
    onJSONChange?: (json: WorkspaceJSON) => void
    onIT4ProgramChange?: (program: IT4Program) => void
}) {
    const {
        className,
        onXmlChange,
        onJSONChange,
        onIT4ProgramChange,
        initialXml,
    } = props
    const { darkMode } = useContext(DarkModeContext)
    const { setError } = useContext(AppContext)
    const [services, setServices] = useState<string[]>([])
    const { toolboxConfiguration, newProjectXml } = useToolbox(services)
    const theme = darkMode === "dark" ? DarkTheme : Theme
    const gridColor = darkMode === "dark" ? "#555" : "#ccc"

    // ReactBlockly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocklyRef = useRef(null)
    const { workspace, xml } = useBlocklyWorkspace({
        ref: blocklyRef,
        toolboxConfiguration,
        workspaceConfiguration: {
            comments: false,
            css: true,
            trashcan: false,
            sounds: false,
            grid: {
                spacing: 25,
                length: 1,
                colour: gridColor,
                snap: true,
            },
            renderer: "zelos",
            theme,
            oneBasedIndex: false,
            move: {
                scrollbars: {
                    vertical: false,
                    horizontal: true,
                },
            },
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2,
                pinch: true,
            },
        },
        initialXml: initialXml || newProjectXml,
        onImportXmlError: () => setError("Error loading blocks..."),
    })

    useEffect(() => {
        if (!workspace) return
        // Add the disableOrphans event handler. This is not done automatically by
        // the plugin and should be handled by your application.
        workspace.addChangeListener(Blockly.Events.disableOrphans)

        // The plugin must be initialized before it has any effect.
        const disableTopBlocksPlugin = new DisableTopBlocks()
        disableTopBlocksPlugin.init()
    }, [workspace])

    // blockly did a change
    useEffect(() => {
        if (!workspace) return

        onXmlChange?.(xml)

        // save json
        if (onJSONChange || onIT4ProgramChange) {
            // emit json
            const json = domToJSON(workspace)
            onJSONChange?.(json)
            if (onIT4ProgramChange) {
                try {
                    const program = workspaceJSONToIT4Program(json)
                    onIT4ProgramChange(program)
                } catch (e) {
                    console.error(e)
                    onIT4ProgramChange(undefined)
                }
            }
        }

        // update toolbox with declared roles
        const newServices = scanServices(workspace)
        if (JSON.stringify(services) !== JSON.stringify(newServices))
            setServices(newServices)
    }, [workspace, xml])

    // track workspace changes and update callbacks
    useEffect(() => {
        if (!workspace) return

        // collect buttons
        const buttons: ButtonDefinition[] = toolboxConfiguration?.contents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(cat => (cat as CategoryDefinition).button)
            .filter(btn => !!btn)
        buttons?.forEach(button =>
            workspace.registerButtonCallback(button.callbackKey, () =>
                Blockly.Variables.createVariableButtonHandler(
                    workspace,
                    null,
                    button.service.shortId
                )
            )
        )
    }, [workspace, JSON.stringify(toolboxConfiguration)])

    return (
        <>
            <BlocklyModalDialogs />
            <div className={className} ref={blocklyRef} />
        </>
    )
}
