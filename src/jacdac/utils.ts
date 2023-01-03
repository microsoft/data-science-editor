export function delay<T>(millis: number, value?: T): Promise<T | undefined> {
    return new Promise(resolve => setTimeout(() => resolve(value), millis))
}

export function toMap<T, V>(
    a: T[],
    keyConverter: (value: T, index: number) => string,
    valueConverter: (value: T, index: number) => V,
    ignoreMissingValues?: boolean
): Record<string, V> {
    const m: Record<string, V> = {}
    if (a)
        for (let i = 0; i < a.length; ++i) {
            const key = keyConverter(a[i], i)
            if (key === undefined || key === null) continue
            const v = valueConverter(a[i], i)
            if (ignoreMissingValues && (v === undefined || v === null)) continue
            m[key] = v
        }
    return m
}

export function arrayConcatMany<T>(arrs: T[][]): T[] {
    if (!arrs) return undefined

    // weed out empty array
    arrs = arrs.filter(a => !!a?.length)

    let sz = 0
    for (const buf of arrs) sz += buf.length
    const r: T[] = new Array(sz)
    sz = 0
    for (const arr of arrs) {
        for (let i = 0; i < arr.length; ++i) r[i + sz] = arr[i]
        sz += arr.length
    }
    return r
}

export function inIFrame() {
    try {
        return typeof window !== "undefined" && window.self !== window.top
    } catch (e) {
        return typeof window !== "undefined"
    }
}

export function humanify(name: string) {
    return name
        ?.replace(/([a-z])([A-Z])/g, (_, a, b) => a + " " + b)
        .replace(/(-|_)/g, " ")
}

export function roundWithPrecision(
    x: number,
    digits: number,
    round = Math.round
): number {
    digits = digits | 0
    // invalid digits input
    if (digits <= 0) return round(x)
    if (x == 0) return 0
    let r = 0
    while (r == 0 && digits < 21) {
        const d = Math.pow(10, digits++)
        r = round(x * d + Number.EPSILON) / d
    }
    return r
}

export function JSONTryParse<T = unknown>(
    src: string,
    defaultValue?: T
): T | undefined | null {
    if (src === undefined) return undefined
    if (src === null) return null

    try {
        return JSON.parse(src) as T
    } catch (e) {
        return defaultValue
    }
}