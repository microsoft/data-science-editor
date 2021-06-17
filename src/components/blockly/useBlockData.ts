import { BlockServices, BlockWithServices } from "./WorkspaceContext"
import { Block } from "blockly"
import { useCallback, useEffect } from "react"
import useChangeThrottled from "../../jacdac/useChangeThrottled"
import useDragDebounce from "./useDragDebounce"

// eslint-disable-next-line @typescript-eslint/ban-types
export default function useBlockData<T extends object[]>(
    block: Block,
    initialValue?: T[]
) {
    const services = (block as unknown as BlockWithServices)?.jacdacServices
    // data on the current node
    const data = useChangeThrottled<BlockServices, T[]>(
        services,
        _ => _?.data as T[]
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

    return { data: debounced, setData }
}
