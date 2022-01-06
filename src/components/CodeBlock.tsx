import React, { lazy, ReactNode, useContext } from "react"
import Highlight, {
    defaultProps,
    Language,
    PrismTheme,
} from "prism-react-renderer"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import LIGHT_THEME from "prism-react-renderer/themes/github"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DARK_THEME from "prism-react-renderer/themes/vsDark"
import DarkModeContext from "./ui/DarkModeContext"
import { IconButton, Link } from "gatsby-theme-material-ui"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import GetAppIcon from "@mui/icons-material/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import LaunchIcon from "@mui/icons-material/Launch"
import Tooltip from "./ui/Tooltip"
import MakeCodeSnippet from "./makecode/MakeCodeSnippet"
import Suspense from "./ui/Suspense"

import Prism from "prism-react-renderer/prism";
(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-csharp")

const TraceSnippet = lazy(() => import("./trace/TraceSnippet"))
const VanillaCodeButton = lazy(() => import("./ui/VanillaCodeButton"))
const ReactCodeButton = lazy(() => import("./ui/ReactCodeButton"))
const P5JSCodeButton = lazy(() => import("./ui/P5JSCodeButton"))

function HighlightedCode(props: {
    children: string
    codeSandbox?: { p5js?: string; js?: string; tsx?: string; html?: string }
    className?: string
    downloadName?: string
    downloadText?: string
    actions?: ReactNode
    url?: string
}) {
    const {
        children,
        codeSandbox,
        className,
        downloadName,
        downloadText,
        actions,
        url,
    } = props
    const { darkMode } = useContext(DarkModeContext)
    const language = className?.replace(/language-/, "") || ""
    const theme = (darkMode === "dark" ? DARK_THEME : LIGHT_THEME) as PrismTheme
    const valueUri =
        !!downloadText &&
        `data:application/json;charset=UTF-8,${encodeURIComponent(
            downloadText
        )}`

    return (
        <Highlight
            {...defaultProps}
            code={children?.replace(/[\s\r\n]*$/g, "") || ""}
            language={language as Language}
            theme={theme}
        >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={className} style={{ ...style }}>
                    {!!url && (
                        <Link style={{ float: "right" }} href={url} underline="hover">
                            <Tooltip title={`Open ${url}`}>
                                <IconButton size="large">
                                    <LaunchIcon />
                                </IconButton>
                            </Tooltip>
                        </Link>
                    )}
                    {!!downloadText && (
                        <Link
                            style={{ float: "right" }}
                            href={valueUri}
                            download={downloadName || "download"}
                        >
                            <Tooltip title="Download">
                                <IconButton size="large">
                                    <GetAppIcon />
                                </IconButton>
                            </Tooltip>
                        </Link>
                    )}
                    {codeSandbox?.tsx && (
                        <div style={{ float: "right" }}>
                            <Suspense>
                                <ReactCodeButton source={codeSandbox} />
                            </Suspense>
                        </div>
                    )}
                    {codeSandbox?.js && (
                        <div style={{ float: "right" }}>
                            <Suspense>
                                <VanillaCodeButton source={codeSandbox} />
                            </Suspense>
                        </div>
                    )}
                    {codeSandbox?.p5js && (
                        <div style={{ float: "right" }}>
                            <Suspense>
                                <P5JSCodeButton sketch={codeSandbox?.p5js} />
                            </Suspense>
                        </div>
                    )}
                    {actions && <div style={{ float: "right" }}>{actions}</div>}
                    {tokens?.map((line, index) => {
                        const lineProps = getLineProps({ line, key: index })
                        return (
                            <div key={index} {...lineProps}>
                                {line.map((token, key) => (
                                    <span
                                        key={key}
                                        {...getTokenProps({ token, key })}
                                    />
                                ))}
                            </div>
                        )
                    })}
                </pre>
            )}
        </Highlight>
    )
}

export default function CodeBlock(props: {
    children: string
    className?: string
    downloadName?: string
    downloadText?: string
    actions?: ReactNode
    url?: string
}) {
    const { children, className, ...rest } = props
    const language = className?.replace(/language-/, "") || ""
    switch (language) {
        case "trace":
            return (
                <Suspense>
                    <TraceSnippet source={children} />
                </Suspense>
            )
        case "blocks":
            return <MakeCodeSnippet renderedSource={children} />
        case "tsx": {
            const [source, tsx] = children.split(/\n-{5,}\n/gi)
            return (
                <HighlightedCode
                    {...rest}
                    className={"tsx"}
                    codeSandbox={{ tsx }}
                >
                    {source}
                </HighlightedCode>
            )
        }
        case "vanilla": {
            const [source, js, html] = children.split(/\n-{5,}\n/gi)
            return (
                <HighlightedCode
                    {...rest}
                    className={"javascript"}
                    codeSandbox={{ js, html }}
                >
                    {source}
                </HighlightedCode>
            )
        }
        case "p5js": {
            const [source, p5js] = children.split(/\n-{5,}\n/gi)
            return (
                <HighlightedCode
                    {...rest}
                    className={/<html>/.test(source) ? "html" : "javascript"}
                    codeSandbox={{ p5js }}
                >
                    {source}
                </HighlightedCode>
            )
        }
        default:
            return <HighlightedCode {...props} />
    }
}
