import React, { useState, useContext, lazy } from "react"
import {
    parseLogicLog,
    parseTrace,
} from "../../../jacdac-ts/src/jdom/logparser"
import PacketsContext from "../PacketsContext"
import { Trace } from "../../../jacdac-ts/src/jdom/trace/trace"

import Suspense from "../ui/Suspense"
import useSnackbar from "../hooks/useSnackbar"
const ImportButton = lazy(() => import("../ImportButton"))

export default function TraceImportButton(props: {
    icon?: boolean
    disabled?: boolean
}) {
    const { icon, disabled } = props
    const { recording, setReplayTrace } = useContext(PacketsContext)
    const { setError } = useSnackbar()
    const [importing, setImporting] = useState(false)

    const handleFiles = async (files: File[]) => {
        const file = files[0]
        if (file) {
            try {
                setImporting(true)
                const txt = await file.text()

                let trace: Trace
                // let's try a few format and see if we're lucky
                try {
                    trace = parseTrace(txt)
                } catch (e) {
                    console.log(`trace parse error`, e)
                }

                // try logic format
                if (!trace) {
                    try {
                        const frames = parseLogicLog(txt) // ensure format is ok
                        if (frames?.length) trace = new Trace(frames)
                    } catch (e) {
                        console.log(`logic parse error`, e)
                    }
                }

                // found anything?
                if (trace) {
                    console.log(`importing ${trace.frames.length} frames`)
                    setReplayTrace(trace)
                } else setError("could not parse file")
            } finally {
                setImporting(false)
            }
        }
    }

    return (
        <Suspense>
            <ImportButton
                icon={icon}
                disabled={importing || recording || disabled}
                text="Import Trace File"
                onFilesUploaded={handleFiles}
            />
        </Suspense>
    )
}
