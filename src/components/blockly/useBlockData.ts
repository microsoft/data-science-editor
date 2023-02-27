import {
    BlockServices,
    BlockWithServices,
    TRANSFORMED_DATA_CHANGE,
} from "./WorkspaceContext"
import { Block } from "blockly"
import { useCallback, useEffect } from "react"
import useChangeThrottled from "../dom/useChangeThrottled"
import useDragDebounce from "./useDragDebounce"
import useEventRaised from "../dom/useEventRaised"

/**
 * Hook that retreives data associated to a block; triggers re-render when data is updated.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export default function useBlockData<T extends object>(
    block: Block,
    initialValue?: T[],
    throttleTime?: number
) {
    const services = (block as unknown as BlockWithServices)?.blockServices
    const data = useChangeThrottled<BlockServices, T[]>(
        services,
        _ => _?.data as T[],
        throttleTime
    )
    const transformedData = useEventRaised<BlockServices, T[]>(
        TRANSFORMED_DATA_CHANGE,
        services,
        _ => _?.transformedData as T[]
    )
    const setData = useCallback(
        (value: T[]) => {
            if (services) services.data = value
        },
        [services]
    )

    // set initial value
    useEffect(() => {
        if (
            services &&
            initialValue !== undefined &&
            services.data === undefined
        )
            services.data = initialValue
    }, [services])

    // debounce with dragging
    const debounced = useDragDebounce(data)
    const debouncedTransformedData = useDragDebounce(transformedData)

    return {
        data: debounced,
        transformedData: debouncedTransformedData,
        setData,
    }
}
