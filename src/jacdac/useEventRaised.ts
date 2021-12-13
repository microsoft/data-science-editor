import { assert } from "../../jacdac-ts/src/jdom/utils"
import { useMemo, DependencyList } from "react"
import { IEventSource } from "../../jacdac-ts/src/jdom/eventsource"
import { useSubscription } from "use-subscription"

export default function useEventRaised<
    TEventSource extends IEventSource,
    TValue
>(
    eventName: string | string[],
    node: TEventSource,
    query?: (n: TEventSource) => TValue,
    deps?: DependencyList
): TValue {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert((node as any) !== false)
    const subscription = useMemo(
        () => ({
            getCurrentValue: query ? () => query(node) : () => undefined,
            subscribe: callback => {
                const unsubscribe = node?.subscribe(eventName, callback)
                return () => unsubscribe?.()
            },
        }),
        [node, ...(deps || [])]
    )
    return useSubscription(subscription)
}
