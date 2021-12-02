import { Block } from "blockly"
import type {
    DataSliceOptions,
    DataSliceRequest,
} from "../../../workers/data/dist/node_modules/data.worker"
import postTransformData from "../dsl/workers/data.proxy"
import { setBlockDataWarning } from "../WorkspaceContext"

/* eslint-disable @typescript-eslint/ban-types */
export function tidyHeaders(
    data: object[],
    type?: "string" | "number" | "boolean"
) {
    const row = data?.[0] || {}
    let headers = Object.keys(row)
    if (type) headers = headers.filter(header => type === typeof row[header])
    const types = headers.map(header => typeof row[header])
    return { headers, types }
}

export function tidyFindLastValue(data: object[], column: string) {
    if (!data?.length) return undefined
    return data[data.length - 1][column]
}

export function tidyResolveHeader(
    data: object[],
    name: string,
    type?: "string" | "number" | "boolean"
) {
    if (!data || !name) return undefined

    const { headers } = tidyHeaders(data, type)
    return headers.indexOf(name) > -1 ? name : undefined
}

export function tidyResolveFieldColumn(
    data: object[],
    b: Block,
    fieldName: string,
    options?: {
        type?: "string" | "number" | "boolean"
        required?: boolean
    }
) {
    const name = b.getFieldValue(fieldName)
    const { type, required } = options || {}
    const column = tidyResolveHeader(data, name, type)
    if (!column) {
        if (required && !name) setBlockDataWarning(b, `missing columns`)
        else if (name) setBlockDataWarning(b, `${name} not found`)
    }
    return column
}

export function tidyResolveFieldColumns(
    data: object[],
    b: Block,
    fieldName: string,
    type?: "string" | "number" | "boolean"
): string[] {
    const name = b.getFieldValue(fieldName)
    if (!name) return tidyHeaders(data, type)?.headers
    else {
        const header = tidyResolveHeader(data, name, type)
        if (header) return [header]
        else return []
    }
}

export function tidySlice(
    data: object[],
    options: DataSliceOptions
): Promise<object[]> {
    if (!options || !data?.length) return Promise.resolve(data)

    const { length } = data
    const {
        sliceMin = Infinity,
        sliceMax = Infinity,
        sliceHead = Infinity,
        sliceTail = Infinity,
        sliceSample = Infinity,
    } = options

    // shortcut
    if (
        length < sliceMin &&
        length < sliceMax &&
        length < sliceHead &&
        length < sliceTail &&
        length < sliceSample
    )
        return Promise.resolve(data)

    // crunch in webworker
    //console.debug(`slice data`, { data, options })
    return postTransformData(<DataSliceRequest>{
        type: "slice",
        data,
        ...options,
    })
}
