import React, { useContext, useState } from "react"
import Alert from "./ui/Alert"
import AppContext from "./AppContext"

export type ProgressHandler = (p: number) => void

export default function useCall() {
    const { setError: setAppError } = useContext(AppContext)
    const [error, setError] = useState<Error>()
    const [running, setRunning] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleProgress = (p: number) => setProgress(p)

    const call = (handler: (onProgress?: ProgressHandler) => void) => {
        try {
            setRunning(true)
            setError(undefined)
            handler(handleProgress)
        } catch (e) {
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
        } catch (e) {
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
