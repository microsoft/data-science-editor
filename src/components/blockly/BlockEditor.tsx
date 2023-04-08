import React, { useContext, useEffect, useRef, useMemo } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { useBlocklyWorkspace } from "react-blockly";
import { WorkspaceSvg } from "blockly";
import Theme from "@blockly/theme-modern";
import DarkTheme from "@blockly/theme-dark";
import BlocklyModalDialogs from "./BlocklyModalDialogs";
import DarkModeContext from "../shell/DarkModeContext";
import clsx from "clsx";
import { withPrefix } from "gatsby";
import BlockContext from "./BlockContext";
import { useBlockMinimap } from "./BlockMinimap";
import BrowserCompatibilityAlert from "../ui/BrowserCompatibilityAlert";
import { UIFlags } from "../uiflags";
import useSnackbar from "../hooks/useSnackbar";
import { useScreenshotContextMenu } from "./useScreenshot";

const PREFIX = "BlockEditor";

const classes = {
    editor: `${PREFIX}editor`,
};

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.editor}`]: {
        height: `calc(100vh - ${UIFlags.hosted ? 0 : 4.5}rem)`,
        "& .blocklyTreeLabel": {
            fontFamily: theme.typography.fontFamily,
            fontSize: "13px",
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
}));

function SuspendedBlockEditor(props: { className?: string }) {
    const { className } = props;
    const {
        toolboxConfiguration,
        workspaceXml,
        setWorkspace,
        setWorkspaceXml,
    } = useContext(BlockContext);

    const { darkMode } = useContext(DarkModeContext);
    const { setError } = useSnackbar();
    const { palette } = useTheme();
    const theme = darkMode === "dark" ? DarkTheme : Theme;

    const blocklyRef = useRef(null);
    const configuration = useMemo(
        () => ({
            ref: blocklyRef,
            toolboxConfiguration,
            workspaceConfiguration: {
                collapse: false,
                disable: false,
                comments: true,
                css: true,
                trashcan: false,
                sounds: false,
                renderer: "thrasos",
                theme,
                oneBasedIndex: false,
                move: {
                    scrollbars: true,
                },
                media: withPrefix("blockly/media/"),
                zoom: {
                    controls: true,
                    wheel: false,
                    startScale: 1.0,
                    maxScale: 4,
                    minScale: 0.04,
                    scaleSpeed: 1.1,
                    pinch: true,
                },
            },
            initialXml: workspaceXml,
            onImportXmlError: () => {
                console.error(`error loading blocks`);
                setError("Error loading blocks...");
            },
            // TODO: fix typing
        }),
        [toolboxConfiguration]
    );
    const { workspace, xml } = useBlocklyWorkspace(configuration as any) as {
        workspace: WorkspaceSvg;
        xml: string;
    };

    // store ref
    useEffect(() => setWorkspace(workspace), [workspace]);
    useEffect(() => {
        setWorkspaceXml(xml);
    }, [xml]);

    // resize blockly
    useEffect(() => {
        if (typeof ResizeObserver !== "undefined") {
            const observer = new ResizeObserver(() => workspace?.resize());
            observer.observe(blocklyRef.current);
            return () => observer.disconnect();
        }
    }, [workspace, blocklyRef.current]);

    useBlockMinimap(workspace, palette);
    useScreenshotContextMenu();
    return (
        <Root>
            <BrowserCompatibilityAlert
                filter={{
                    chrome: "> 90",
                    edge: "> 90",
                    firefox: "> 90",
                }}
                label="Please use Microsoft Edge 90+ or Google Chrome 90+ for this page."
            />
            <div className={clsx(classes.editor, className)} ref={blocklyRef} />
            <BlocklyModalDialogs />
        </Root>
    );
}

/**
 * A delay loaded block editor
 */
export default function BlockEditor(props: { className?: string }) {
    const { toolboxConfiguration } = useContext(BlockContext);

    if (!toolboxConfiguration) return null;
    return <SuspendedBlockEditor {...props} />;
}
