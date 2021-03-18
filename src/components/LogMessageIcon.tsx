import React from "react"
import { LoggerCmd } from "../../jacdac-ts/src/jdom/constants"

// tslint:disable-next-line: no-submodule-imports match-default-export-name
import WarningIcon from "@material-ui/icons/Warning"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ErrorIcon from "@material-ui/icons/Error"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import MessageIcon from "@material-ui/icons/Message"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import NoteIcon from "@material-ui/icons/Note"

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
