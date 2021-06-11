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
        },
    })
)

export default function BlockEditor(props: { className?: string }) {
    const { className } = props
    const {
        toolboxConfiguration,
        workspaceXml,
        setWorkspace,
        setWorkspaceXml,
    } = useContext(BlockContext)
    const classes = useStyles()
    const { darkMode } = useContext(DarkModeContext)
    const { setError } = useContext(AppContext)
    const theme = darkMode === "dark" ? DarkTheme : Theme

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

    return (
        <>
            <div className={clsx(classes.editor, className)} ref={blocklyRef} />
            <BlocklyModalDialogs />
        </>
    )
}
