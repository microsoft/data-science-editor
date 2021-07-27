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
    const { headers } = tidyHeaders(data, type)
    return headers.indexOf(name) > -1 ? name : undefined
}
