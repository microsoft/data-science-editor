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
import BlocklyModalDialogs from "../vm/BlocklyModalDialogs"
import { domToJSON, WorkspaceJSON } from "../vm/jsongenerator"
import DarkModeContext from "../ui/DarkModeContext"
import AppContext from "../AppContext"
import { createStyles, makeStyles } from "@material-ui/core"
import clsx from "clsx"
import useBlocklyEvents from "../vm/useBlocklyEvents"
import useBlocklyPlugins from "../vm/useBlocklyPlugins"
import { withPrefix } from "gatsby"
import useDataToolbox from "./useDataToolbox"

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

export default function DSBlockEditor(props: {
    className?: string
    initialXml?: string
    onXmlChange?: (xml: string) => void
    onJSONChange?: (json: WorkspaceJSON) => void
    workspaceRef?: MutableRefObject<WorkspaceSvg>
}) {
    const { className, onXmlChange, onJSONChange, initialXml, workspaceRef } =
        props
    const classes = useStyles()
    const { darkMode } = useContext(DarkModeContext)
    const { setError } = useContext(AppContext)
    const [source, setSource] = useState<WorkspaceJSON>()
    const { toolboxConfiguration } = useDataToolbox(source)
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
            media: withPrefix("blockly/media/"),
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
        initialXml: initialXml,
        onImportXmlError: () => setError("Error loading blocks..."),
    }) as { workspace: WorkspaceSvg; xml: string }

    // store ref
    useEffect(() => {
        if (workspaceRef) {
            workspaceRef.current = workspace
            return () => (workspaceRef.current = undefined)
        }
    }, [workspace, workspaceRef])

    // plugins
    useBlocklyPlugins(workspace)
    useBlocklyEvents(workspace)

    // blockly did a change
    useEffect(() => {
        if (!workspace || workspace.isDragging()) return

        onXmlChange?.(xml)

        // save json
        if (onJSONChange) {
            // emit json
            const newSource = domToJSON(workspace)
            if (JSON.stringify(newSource) !== JSON.stringify(source)) {
                setSource(newSource)
                onJSONChange?.(newSource)
            }
        }
    }, [workspace, xml])

    // resize blockly
    useEffect(() => {
        const observer = new ResizeObserver(() => workspace?.resize())
        observer.observe(blocklyRef.current)
        return () => observer.disconnect()
    }, [workspace, blocklyRef.current])

    return (
        <>
            <div className={clsx(classes.editor, className)} ref={blocklyRef} />
            <BlocklyModalDialogs />
        </>
    )
}
