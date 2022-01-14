import { useEffect, useState } from "react"

export default function useBlobURL(blob: Blob): string {
    const [url, setUrl] = useState<string>(undefined)
    useEffect(() => {
        const u = blob && URL.createObjectURL(blob)
        setUrl(u)
        return () => u && URL.revokeObjectURL(u)
    }, [blob])
    return url
}
