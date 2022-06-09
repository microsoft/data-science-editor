/* eslint-disable jsx-a11y/media-has-caption */
import React, {
    useEffect,
    useRef,
    useState,
} from "react"
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import StopIcon from "@mui/icons-material/Stop"
import { downloadUrl } from "../../../jacdac-ts/src/embed/filestorage"
import IconButtonWithProgress from "./IconButtonWithProgress"
import { delay } from "../../../jacdac-ts/src/jdom/utils"

export function supportsMediaRecorder() {
    return typeof MediaRecorder !== "undefined"
}

async function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    console.debug(`webcam: download ${url}`)
    downloadUrl(url, name)
    await delay(5000)
    window.URL.revokeObjectURL(url)
}

export function MediaRecorderButton(props: { stream: MediaStream }) {
    const { stream } = props
    const [recording, setRecording] = useState(false)
    const recorderRef = useRef<MediaRecorder>(null)

    const startRecording = async () => {
        console.debug(`webcam: start recording`)
        const chunks: Blob[] = []
        const options = {
            mimeType: "video/webm;codecs=H264",
        }
        const recorder = (recorderRef.current = new MediaRecorder(
            stream,
            options
        ))
        recorder.ondataavailable = (e: BlobEvent) => {
            console.debug(`webcam: recording chunk`, { data: e.data })
            e.data.size && chunks.push(e.data)
        }

        const download = () => {
            console.debug(`webcam: download webm (chunks: ${chunks.length})`, {
                chunks,
            })
            const blob = new Blob(chunks, {
                type: "video/webm",
            })
            downloadBlob(blob, "recording.webm")
        }

        recorder.onstop = download
        recorder.onerror = download
        recorder.start()
        setRecording(true)
    }

    const stopRecording = () => {
        console.debug(`webcam: stop recording`)
        try {
            if (recorderRef.current?.state === "recording")
                recorderRef.current?.stop()
        } catch (e) {
            console.debug(e)
        }
        recorderRef.current = undefined
        setRecording(false)
    }
    useEffect(() => {
        stopRecording()
        return () => stopRecording()
    }, [stream])

    return (
        <IconButtonWithProgress
            indeterminate={recording}
            disabled={!stream}
            title={recording ? "Stop recording" : "Start recording"}
            onClick={recording ? stopRecording : startRecording}
        >
            {recording ? <StopIcon /> : <FiberManualRecordIcon />}
        </IconButtonWithProgress>
    )
}
