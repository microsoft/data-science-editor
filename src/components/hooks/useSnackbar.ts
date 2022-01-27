import { useSnackbar as NoistackUseSnackbar } from "notistack"
import { ReactNode } from "react"
import { errorCode } from "../../../jacdac-ts/src/jdom/error"
import { isCancelError } from "../../../jacdac-ts/src/jdom/utils"
import useAnalytics from "./useAnalytics"

export default function useSnackbar() {
    const { trackError } = useAnalytics()
    const { enqueueSnackbar: _enqueueSnackbar } = NoistackUseSnackbar()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setError = (e: any) => {
        if (!e || isCancelError(e)) return
        const msg = e?.message || e + ""
        const code = errorCode(e)

        console.error(msg, { code, error: e })
        trackError?.(e, {
            code,
        })
        _enqueueSnackbar(msg, {
            variant: "error",
            autoHideDuration: code ? 8000 : 4000,
            preventDuplicate: true,
        })
    }

    const enqueueSnackbar = (
        message: string | ReactNode,
        variant?: "success" | "warning" | "info"
    ) => _enqueueSnackbar(message, { variant })

    return {
        enqueueSnackbar,
        setError
    }
}