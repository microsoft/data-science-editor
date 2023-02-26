import {
    arrange,
    desc,
    first,
    groupBy,
    n,
    sliceHead,
    summarize,
    SummarizeSpec,
    tidy,
} from "@tidyjs/tidy"
import { Block } from "blockly"
import type {
    DataSliceOptions,
    DataSliceRequest,
} from "../../../workers/data/dist/node_modules/data.worker"
import { DataType } from "../../dom/constants"
import postTransformData from "../dsl/workers/data.proxy"
import { setBlockDataWarning } from "../WorkspaceContext"

/* eslint-disable @typescript-eslint/ban-types */
export function tidyHeaders(data: object[], type?: DataType) {
    const row = data?.[0] || {}
    let headers = Object.keys(row)
    if (type) headers = headers.filter(header => type === typeof row[header])
    const types: DataType[] = headers.map(header => typeof row[header]) as any
    return { headers, types }
}

export function summarizeCounts(data: object[], column: string, slice: number) {
    const items: SummarizeSpec<Object> = {}
    items["name"] = first(column as any)
    items["count"] = n()
    const res = tidy(
        data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        groupBy(column as any, [summarize(items)]),
        arrange([desc("count")]),
        sliceHead(slice)
    )
    return res
}

export function tidyFindLastValue(data: object[], column: string) {
    if (!data?.length) return undefined
    return data[data.length - 1][column]
}

export function tidyResolveHeader(
    data: object[],
    name: string,
    type?: DataType
) {
    if (!data || !name) return undefined

    const { headers } = tidyHeaders(data, type)
    return headers.indexOf(name) > -1 ? name : undefined
}

export function tidyResolveHeaderType(data: object[], name: string) {
    if (!data || !name) return undefined

    const { headers, types } = tidyHeaders(data)
    return types[headers.indexOf(name)]
}

export function tidyResolveFieldColumn(
    data: object[],
    b: Block,
    fieldName: string,
    options?: {
        type?: DataType
        required?: boolean
    }
) {
    const name = b.getFieldValue(fieldName)
    const { type, required } = options || {}
    const column = tidyResolveHeader(data, name, type)
    if (!column) {
        if (required && !name) setBlockDataWarning(b, `missing column name`)
        else if (name) setBlockDataWarning(b, `'${name}' not found`)
        console.debug("data column not found", {
            fieldName,
            name,
            type,
            required,
            data,
        })
    }
    return column
}

export function tidyResolveFieldColumns(
    data: object[],
    b: Block,
    fieldName: string,
    type?: DataType
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
