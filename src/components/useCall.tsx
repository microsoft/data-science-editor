import React, { useState } from "react"
import Alert from "./ui/Alert"
import useSnackbar from "./hooks/useSnackbar"

export type ProgressHandler = (p: number) => void

export default function useCall() {
    const { setError: setAppError } = useSnackbar()
    const [error, setError] = useState<any>()
    const [running, setRunning] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleProgress = (p: number) => setProgress(p)

    const call = (handler: (onProgress?: ProgressHandler) => void) => {
        try {
            setRunning(true)
            setError(undefined)
            handler(handleProgress)
        } catch (e: unknown) {
            setError(e)
            setAppError(e)
        } finally {
            setRunning(false)
        }
    }
    const callAsync = async (
        handler: (onProgress?: (p: number) => void) => Promise<void>
    ) => {
        try {
            setRunning(true)
            setError(undefined)
            await handler(handleProgress)
        } catch (e: unknown) {
            setError(e)
            setAppError(e)
        } finally {
            setRunning(false)
        }
    }
    const alert = error && <Alert severity="error">{error}</Alert>

    return {
        running,
        error,
        progress,
        alert,
        call,
        callAsync,
    }
}
