function configureUIFlags() {
    if (typeof window === "undefined" || typeof URLSearchParams === "undefined")
        return

    const location = window.location
    const params = new URLSearchParams(location.search)
    UIFlags.diagnostics = params.get(`dbg`) === "1"
    UIFlags.hosted = params.get("embed") === "1"
    UIFlags.storage = params.get("storage") !== "0"
}

export class UIFlags {
    static diagnostics = false
    static hosted = false
    static storage = true
}

configureUIFlags()