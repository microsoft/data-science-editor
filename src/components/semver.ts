interface Version {
    major: number
    minor: number
    patch: number
    pre: string[]
    build: string[]
}

function cmp(a: Version, b: Version) {
    if (!a)
        if (!b) return 0
        else return 1
    else if (!b) return -1
    else {
        let d = a.major - b.major || a.minor - b.minor || a.patch - b.patch
        if (d) return d
        if (a.pre.length == 0 && b.pre.length > 0) return 1
        if (a.pre.length > 0 && b.pre.length == 0) return -1
        for (let i = 0; i < a.pre.length + 1; ++i) {
            const aa = a.pre[i]
            const bb = b.pre[i]
            if (!aa)
                if (!bb) return 0
                else return -1
            else if (!bb) return 1
            else if (/^\d+$/.test(aa))
                if (/^\d+$/.test(bb)) {
                    d = parseInt(aa) - parseInt(bb)
                    if (d) return d
                } else return -1
            else if (/^\d+$/.test(bb)) return 1
            else {
                d = strcmp(aa, bb)
                if (d) return d
            }
        }
        return 0
    }
}

function tryParse(v: string): Version {
    if (!v) return null
    if ("*" === v) {
        return {
            major: Number.MAX_SAFE_INTEGER,
            minor: Number.MAX_SAFE_INTEGER,
            patch: Number.MAX_SAFE_INTEGER,
            pre: [],
            build: [],
        }
    }
    if (/^v\d/i.test(v)) v = v.slice(1)
    const m = /^(\d+)\.(\d+)\.(\d+)(-([0-9a-zA-Z\-\.]+))?(\+([0-9a-zA-Z\-\.]+))?$/.exec(
        v
    )
    if (m)
        return {
            major: parseInt(m[1]),
            minor: parseInt(m[2]),
            patch: parseInt(m[3]),
            pre: m[5] ? m[5].split(".") : [],
            build: m[7] ? m[7].split(".") : [],
        }
    return null
}

function strcmp(a: string, b: string) {
    if (a === b) return 0
    if (a < b) return -1
    else return 1
}

export function semverCmp(a: string, b: string) {
    const aa = tryParse(a)
    const bb = tryParse(b)
    if (!aa && !bb) return strcmp(a, b)
    else return cmp(aa, bb)
}
