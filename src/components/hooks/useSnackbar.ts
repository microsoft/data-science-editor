import { useSnackbar as NoistackUseSnackbar } from "notistack"
import { ReactNode } from "react"
import useAnalytics from "./useAnalytics"

export default function useSnackbar() {
    const { trackError } = useAnalytics()
    const { enqueueSnackbar: _enqueueSnackbar } = NoistackUseSnackbar() || {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setError = (e: any) => {
        if (!e) return
        const msg = e?.message || e + ""

        console.error(msg, { error: e })
        trackError?.(e, {})
        _enqueueSnackbar?.(msg, {
            variant: "error",
            autoHideDuration: 4000,
            preventDuplicate: true,
        })
    }

    const enqueueSnackbar = (
        message: string | ReactNode,
        variant?: "success" | "warning" | "info"
    ) => _enqueueSnackbar?.(message, { variant })

    return {
        enqueueSnackbar,
        setError,
    }
}
