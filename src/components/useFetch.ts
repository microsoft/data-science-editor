import { useState } from "react"
import useEffectAsync from "./useEffectAsync"

export default function useFetch<T>(url: RequestInfo, options?: RequestInit) {
    const [response, setResponse] = useState<T>(undefined)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [error, setError] = useState<any>(undefined)
    const [status, setStatus] = useState<number>(undefined)
    const [loading, setLoading] = useState(true) // start in loading mode

    useEffectAsync(
        async mounted => {
            setLoading(true)
            try {
                if (!url) {
                    setStatus(404)
                    setResponse(undefined)
                } else {
                    const res = await fetch(url, options)
                    if (!mounted()) return
                    const status = res.status
                    setStatus(status)
                    if (status >= 200 && status <= 204) {
                        const json = await res.json()
                        if (!mounted()) return
                        setResponse(json)
                    }
                }
            } catch (error) {
                if (!mounted()) return
                setError(error)
            } finally {
                if (mounted()) setLoading(false)
            }
        },
        [url]
    )

    return {
        response,
        error,
        status,
        loading,
    }
}
