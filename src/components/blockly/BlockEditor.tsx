import React, { useContext, useEffect, useRef } from "react"
import { useBlocklyWorkspace } from "react-blockly"
import { WorkspaceSvg } from "blockly"
import Theme from "@blockly/theme-modern"
import DarkTheme from "@blockly/theme-dark"
import BlocklyModalDialogs from "./BlocklyModalDialogs"
import DarkModeContext from "../ui/DarkModeContext"
import AppContext from "../AppContext"
import { createStyles, makeStyles } from "@material-ui/core"
import clsx from "clsx"
import { withPrefix } from "gatsby"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import BlockContext from "./BlockContext"
import { useBlockMinimap } from "./BlockMinimap"
import BrowserCompatibilityAlert from "../ui/BrowserCompatibilityAlert"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        editor: {
            height: `calc(100vh - ${Flags.diagnostics ? 15 : 10}rem)`,
            "& .blocklyTreeLabel": {
                fontFamily: theme.typography.fontFamily,
            },
            "& .blocklyText": {
                fontWeight: `normal !important`,
                fontFamily: `${theme.typography.fontFamily} !important`,
            },
            "& .blocklyTreeIconOpen, & .blocklyTreeIconClosed": {
                opacity: 0.5,
            },
            "& .blocklyFieldButton.blocklyEditableText": {
                cursor: "pointer",
            },
            "& .blocklyFieldButton.blocklyEditableText > text": {
                fill: "#ffffff",
            },
            "& .blocklyFieldButton.blocklyEditableText > .blocklyFieldRect": {
                fill: "transparent !important",
            },
        },
    })
)

export default function BlockEditor(props: {
    editorId: string
    className?: string
}) {
    const { editorId, className } = props
    const {
        toolboxConfiguration,
        workspaceXml,
        setWorkspace,
        setWorkspaceXml,
        setEditorId,
    } = useContext(BlockContext)
    const classes = useStyles()
    const { darkMode } = useContext(DarkModeContext)
    const { setError } = useContext(AppContext)
    const theme = darkMode === "dark" ? DarkTheme : Theme

    // setup editor id in context
    useEffect(() => {
        setEditorId(editorId)
        return () => setEditorId("")
    }, [editorId])

    // ReactBlockly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocklyRef = useRef(null)
    const { workspace, xml } = useBlocklyWorkspace({
        ref: blocklyRef,
        toolboxConfiguration,
        workspaceConfiguration: {
            collapse: false,
            disable: false,
            comments: true,
            css: true,
            trashcan: false,
            sounds: false,
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
                wheel: false,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.08,
                scaleSpeed: 1.1,
                pinch: true,
            },
        },
        initialXml: workspaceXml,
        onImportXmlError: () => setError("Error loading blocks..."),
    }) as { workspace: WorkspaceSvg; xml: string }

    // store ref
    useEffect(() => setWorkspace(workspace), [workspace])
    useEffect(() => setWorkspaceXml(xml), [xml])

    // resize blockly
    useEffect(() => {
        const observer = new ResizeObserver(() => workspace?.resize())
        observer.observe(blocklyRef.current)
        return () => observer.disconnect()
    }, [workspace, blocklyRef.current])

    useBlockMinimap(workspace)

    return (
        <div>
            <BrowserCompatibilityAlert
                filter={{
                    chrome: "> 90",
                    edge: "> 90",
                    firefox: "> 90"
                }}
                label="Please use Microsoft Edge 90+ or Google Chrome 90+ for this page."
            />
            <div className={clsx(classes.editor, className)} ref={blocklyRef} />
            <BlocklyModalDialogs />
        </div>
    )
}
