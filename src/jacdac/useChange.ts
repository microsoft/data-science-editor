import { useState, useEffect, useMemo } from "react"
import { CHANGE } from "../../jacdac-ts/src/jdom/constants"
import { IEventSource } from "../../jacdac-ts/src/jdom/eventsource"
import { assert } from "../../jacdac-ts/src/jdom/utils"
import useEffectAsync from "../components/useEffectAsync"

export default function useChange<TNode extends IEventSource, TValue>(
    node: TNode,
    query?: (n: TNode) => TValue,
    deps?: React.DependencyList
): TValue {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert(node as any !== false)
    const [version, setVersion] = useState(node?.changeId || 0)
    const value = useMemo(
        () => (query ? query(node) : undefined),
        [node, version]
    )

    useEffect(() => {
        setVersion(node?.changeId || 0)
        return node?.subscribe(CHANGE, () => {
            //console.log(`change ${node} ${version}->${node.changeId}`)
            setVersion(node.changeId)
        })
    }, [node, ...(deps || [])])

    return value
}

export function useChangeAsync<TNode extends IEventSource, TValue>(
    node: TNode,
    query?: (n: TNode) => Promise<TValue>,
    deps?: React.DependencyList
): TValue {
    const [version, setVersion] = useState(node?.changeId || 0)
    const [value, setValue] = useState(undefined)

    useEffect(() => {
        setVersion(node?.changeId || 0)
        node?.subscribe(CHANGE, () => {
            setVersion(node.changeId)
        })
    }, [node])

    useEffectAsync(
        async mounted => {
            const valuePromise = query ? query(node) : undefined
            if (!valuePromise) {
                if (mounted()) setValue(undefined)
            } else {
                const d = await valuePromise
                if (mounted()) setValue(d)
            }
        },
        [node, version, ...(deps || [])]
    )

    return value
}
