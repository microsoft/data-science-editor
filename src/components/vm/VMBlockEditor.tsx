import React, { useContext, useEffect, useRef, useState } from "react"
import { useBlocklyWorkspace } from "react-blockly"
import Blockly from "blockly"
import "@blockly/field-slider"
import "@blockly/block-dynamic-connection"
import Theme from "@blockly/theme-modern"
import DarkTheme from "@blockly/theme-dark"
import useToolbox, { scanServices, useToolboxButtons } from "./useToolbox"
import BlocklyModalDialogs from "./BlocklyModalDialogs"
import { domToJSON, WorkspaceJSON } from "./jsongenerator"
import DarkModeContext from "../ui/DarkModeContext"
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import workspaceJSONToIT4Program from "./it4generator"
import AppContext from "../AppContext"
import { createStyles, makeStyles } from "@material-ui/core"
import clsx from "clsx"
import { IT4ProgramRunner } from "../../../jacdac-ts/src/vm/vmrunner"
import useBlocklyEvents from "./useBlocklyEvents"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        editor: {
            height: "calc(100vh - 10rem)",
            "& .blocklyTreeLabel": {
                fontFamily: theme.typography.fontFamily,
            },
            "& .blocklyText": {
                fontWeight: `normal !important`,
                fontFamily: `${theme.typography.fontFamily} !important`,
            },
        },
    })
)

export default function VMBlockEditor(props: {
    className?: string
    initialXml?: string
    onXmlChange?: (xml: string) => void
    onJSONChange?: (json: WorkspaceJSON) => void
    onIT4ProgramChange?: (program: IT4Program) => void
    runner?: IT4ProgramRunner
    serviceClass?: number
}) {
    const {
        className,
        onXmlChange,
        onJSONChange,
        onIT4ProgramChange,
        initialXml,
        serviceClass,
    } = props
    const classes = useStyles()
    const { darkMode } = useContext(DarkModeContext)
    const { setError } = useContext(AppContext)
    const [services, setServices] = useState<string[]>([])
    const { toolboxConfiguration, newProjectXml, serviceBlocks } = useToolbox({
        blockServices: services,
        serviceClass,
    })
    const theme = darkMode === "dark" ? DarkTheme : Theme
    const gridColor = darkMode === "dark" ? "#555" : "#ccc"

    // ReactBlockly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocklyRef = useRef(null)
    const { workspace, xml } = useBlocklyWorkspace({
        ref: blocklyRef,
        toolboxConfiguration,
        workspaceConfiguration: {
            collapse: false,
            disable: false,
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
                minScale: 0.1,
                scaleSpeed: 1.2,
                pinch: true,
            },
        },
        initialXml: initialXml || newProjectXml,
        onImportXmlError: () => setError("Error loading blocks..."),
    }) as { workspace: Blockly.WorkspaceSvg; xml: string }

    // listen for events needed for field editors
    useBlocklyEvents(workspace)
    // setup buttons
    useToolboxButtons(workspace, toolboxConfiguration)

    // code serialization

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
                    const program = workspaceJSONToIT4Program(
                        serviceBlocks,
                        json
                    )
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

    return (
        <>
            <BlocklyModalDialogs />
            <div className={clsx(classes.editor, className)} ref={blocklyRef} />
        </>
    )
}
