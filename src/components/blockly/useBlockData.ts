import { BlockServices, BlockWithServices } from "./WorkspaceContext"
import { Block } from "blockly"
import { useCallback, useEffect } from "react"
import useChangeThrottled from "../dom/useChangeThrottled"
import useDragDebounce from "./useDragDebounce"

// eslint-disable-next-line @typescript-eslint/ban-types
export default function useBlockData<T extends object>(
    block: Block,
    initialValue?: T[],
    throttleTime?: number
) {
    const services = (block as unknown as BlockWithServices)?.blockServices
    // data on the current node
    const { data, transformedData } = useChangeThrottled<
        BlockServices,
        { data: T[]; transformedData: T[] }
    >(
        services,
        _ => ({
            data: _?.data as T[],
            transformedData: _?.transformedData as T[],
        }),
        throttleTime
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
