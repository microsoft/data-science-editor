import React, { useEffect } from "react"

export default function useEffectAsync(
    effect: (mounted?: () => boolean) => Promise<void>,
    dependencies?: React.DependencyList
) {
    useEffect(() => {
        let mounted = true
        effect(() => mounted)
        return () => {
            mounted = false
        }
    }, dependencies)
}
