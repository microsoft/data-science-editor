import React, { useContext } from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import SaveIcon from "@material-ui/icons/Save"
import ServiceManagerContext from "../ServiceManagerContext"
import PacketsContext from "../PacketsContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

export default function TraceSaveButton() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { replayTrace, view, recording, tracing } = useContext(PacketsContext)
    const { fileStorage } = useContext(ServiceManagerContext)
    const saveTrace = () => {
        const busText = bus.describe()
        const savedTrace = replayTrace || view.trace
        const traceText = savedTrace.serializeToText()
        const text = `# Jacdac Trace

## devices

\`\`\`yaml
${busText}
\`\`\`

## packets

\`\`\`
${traceText}
\`\`\`
`
        console.log({ busText, traceText, text })
        fileStorage.saveText("trace.jd.txt", text)
    }
    return (
        <IconButtonWithTooltip
            title="save trace"
            disabled={recording || tracing}
            size="small"
            key="save"
            onClick={saveTrace}
        >
            <SaveIcon />
        </IconButtonWithTooltip>
    )
}
