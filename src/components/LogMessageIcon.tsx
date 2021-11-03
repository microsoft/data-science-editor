import React from "react"
import { LoggerCmd } from "../../jacdac-ts/src/jdom/constants"

// tslint:disable-next-line: no-submodule-imports match-default-export-name
import WarningIcon from "@mui/icons-material/Warning"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ErrorIcon from "@mui/icons-material/Error"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import MessageIcon from "@mui/icons-material/Message"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import NoteIcon from "@mui/icons-material/Note"

export default function LogMessageIcon(props: {
    identifier: LoggerCmd
    className?: string
}) {
    const { identifier, ...others } = props
    switch (identifier) {
        case LoggerCmd.Warn:
            return <WarningIcon {...others} />
        case LoggerCmd.Error:
            return <ErrorIcon {...others} />
        case LoggerCmd.Debug:
            return <NoteIcon {...others} />
        default:
            return <MessageIcon {...others} />
    }
}
