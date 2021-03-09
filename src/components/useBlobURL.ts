import { useEffect, useState } from "react";

export default function (blob: Blob): string {
    const [url, setUrl] = useState<string>(undefined);
    useEffect(() => {
        const u = URL.createObjectURL(blob && URL.createObjectURL(blob))
        setUrl(u);
        return () => u && URL.revokeObjectURL(u);
    }, [blob]);
    return url;
}