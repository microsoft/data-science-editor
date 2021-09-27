import React, { useContext } from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import SaveIcon from "@material-ui/icons/Save"
import ServiceManagerContext from "../ServiceManagerContext"
import PacketsContext from "../PacketsContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { Link } from "@material-ui/core"

export default function TraceSaveButton(props: { variant?: "link" | "icon" }) {
    const { variant } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { replayTrace, view } = useContext(PacketsContext)
    const { fileStorage } = useContext(ServiceManagerContext)
    const saveTrace = () => {
        const repo = process.env.GATSBY_GITHUB_REPOSITORY
        const sha = process.env.GATSBY_GITHUB_SHA
        const busText = bus.describe()
        const savedTrace = replayTrace || view.trace
        const traceText = savedTrace.serializeToText()
        const text = `# Jacdac Trace 
        
To import, go to https://aka.ms/jacdac, open device tree and click import icon.

## bus

\`\`\`yaml
${busText}
\`\`\`

## packets

\`\`\`
${traceText}
\`\`\`

## environment

\`\`\`yaml
jacdac: https://github.com/${repo}/commit/${sha}
user-agent: ${typeof window !== undefined && window.navigator.userAgent}
\`\`\`

`
        fileStorage.saveText("trace.jd.txt", text)
    }
    return variant === "link" ? (
        <Link
            title="save trace and environment information in a file"
            component="button"
            onClick={saveTrace}
        >
            Save trace
        </Link>
    ) : (
        <IconButtonWithTooltip
            title="save trace"
            size="small"
            key="save"
            onClick={saveTrace}
        >
            <SaveIcon />
        </IconButtonWithTooltip>
    )
}
