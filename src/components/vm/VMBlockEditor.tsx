import React, {
    MutableRefObject,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import { useBlocklyWorkspace } from "react-blockly"
import { WorkspaceSvg } from "blockly"
import Theme from "@blockly/theme-modern"
import DarkTheme from "@blockly/theme-dark"
import useToolbox, { useToolboxButtons } from "./useToolbox"
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
import useBlocklyPlugins from "./useBlocklyPlugins"
import {
    BlocklyWorkspaceWithServices,
    WorkspaceServices,
} from "./WorkspaceContext"
import { RoleManager } from "../../../jacdac-ts/src/vm/rolemanager"
import { arrayConcatMany, toMap } from "../../../jacdac-ts/src/jdom/utils"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        editor: {
            height: "calc(100vh - 7rem)",
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
    roleManager?: RoleManager
    serviceClass?: number
    workspaceRef?: MutableRefObject<WorkspaceSvg>
}) {
    const {
        className,
        onXmlChange,
        onJSONChange,
        onIT4ProgramChange,
        initialXml,
        serviceClass,
        runner,
        roleManager,
        workspaceRef,
    } = props
    const classes = useStyles()
    const { darkMode } = useContext(DarkModeContext)
    const { setError } = useContext(AppContext)
    const [source, setSource] = useState<WorkspaceJSON>()
    const [program, setProgram] = useState<IT4Program>()
    const { toolboxConfiguration, newProjectXml } = useToolbox({
        serviceClass,
        source,
        program,
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
                    vertical: true,
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
    }) as { workspace: WorkspaceSvg; xml: string }

    // store ref
    useEffect(() => {
        if (workspaceRef) {
            workspaceRef.current = workspace
            return () => (workspaceRef.current = undefined)
        }
    }, [workspace, workspaceRef])

    // surface state to react
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ws = workspace as any as BlocklyWorkspaceWithServices
        if (ws) ws.jacdacServices = new WorkspaceServices()
    }, [workspace])
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ws = workspace as any as BlocklyWorkspaceWithServices
        const services = ws?.jacdacServices
        if (services) {
            services.runner = runner
        }
    }, [workspace, runner])
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ws = workspace as any as BlocklyWorkspaceWithServices
        const services = ws?.jacdacServices
        if (services) {
            services.roleManager = roleManager
        }
    }, [workspace, roleManager])

    // plugins
    useBlocklyPlugins(workspace)
    useBlocklyEvents(workspace)
    useToolboxButtons(workspace, toolboxConfiguration)

    // blockly did a change
    useEffect(() => {
        if (!workspace || workspace.isDragging()) return

        onXmlChange?.(xml)

        // save json
        if (onJSONChange || onIT4ProgramChange) {
            // emit json
            const newSource = domToJSON(workspace)
            if (JSON.stringify(newSource) !== JSON.stringify(source)) {
                setSource(newSource)
                onJSONChange?.(newSource)
                if (onIT4ProgramChange) {
                    try {
                        const newProgram = workspaceJSONToIT4Program(newSource)
                        if (
                            JSON.stringify(newProgram) !==
                            JSON.stringify(program)
                        ) {
                            setProgram(newProgram)
                            onIT4ProgramChange(newProgram)
                        }
                    } catch (e) {
                        console.error(e)
                        onIT4ProgramChange(undefined)
                    }
                }
            }
        }
    }, [workspace, xml])

    // apply errors
    useEffect(() => {
        if (!workspace) return
        const allErrors = toMap(
            arrayConcatMany(
                program?.handlers.map(h => h.errors?.filter(e => !!e.sourceId))
            ) || [],
            e => e.sourceId,
            e => e.message
        )
        workspace
            .getAllBlocks(false)
            .forEach(b => b.setWarningText(allErrors[b.id] || null))
    }, [workspace, program])

    return (
        <>
            <div className={clsx(classes.editor, className)} ref={blocklyRef} />
            <BlocklyModalDialogs />
        </>
    )
}
