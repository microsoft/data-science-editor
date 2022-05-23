import { arrayEq, assert } from "../../jacdac-ts/src/jdom/utils"
import { useMemo, DependencyList } from "react"
import { IEventSource } from "../../jacdac-ts/src/jdom/eventsource"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"

/**
 * A hook to track event and update a state snapshot
 */
export default function useEventRaised<
    TEventSource extends IEventSource,
    TValue
>(
    eventName: string | string[],
    node: TEventSource,
    query: (n: TEventSource) => TValue,
    deps?: DependencyList,
    isEqual?: (a: TValue, b: TValue) => boolean
): TValue {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert((node as any) !== false)
    const subscription = useMemo(
        () => ({
            getSnapshot: () => query?.(node),
            selector: _ => _,
            subscribe: (onStoreChanged: () => void) => {
                const unsubscribe = node?.subscribe(eventName, onStoreChanged)
                return () => unsubscribe?.()
            },
            isEqual: isEqual
                ? isEqual
                : (a: TValue, b: TValue) => {
                      if (Array.isArray(a)) {
                          const e = arrayEq(
                              a as unknown as unknown[],
                              b as unknown as unknown[]
                          )
                          return e
                      } else return Object.is(a, b)
                  },
        }),
        [node, ...(deps || [])]
    )
    return useSyncExternalStoreWithSelector(
        subscription.subscribe,
        subscription.getSnapshot,
        undefined,
        subscription.selector,
        subscription.isEqual
    )
}
