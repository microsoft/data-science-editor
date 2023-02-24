import Layout from "./src/components/layout"
import React from "react"
import ReactDOM from "react-dom"

const UPDATE_DEBOUNCE = 5000
let lastUpdate = Date.now()
function tryUpdate(force) {
    const now = Date.now()
    if (now - lastUpdate < UPDATE_DEBOUNCE) return
    lastUpdate = now

    setTimeout(async () => {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) reg.update()
        else if (
            force &&
            window.navigator.onLine &&
            !/http:\/\/localhost/.test(window.location.href)
        ) {
            console.debug(`check for updates`)
            try {
                const req = await fetch("/data-science-editor/version.json")
                if (!req.ok) {
                    console.debug(`fetch version.json failed, probably offline`)
                    return
                }
                const version = await req.json()
                console.log(`version info`, {
                    version,
                    sha: window.analytics.sha,
                })
                if (
                    version &&
                    version.sha &&
                    window.analytics &&
                    version.sha !== window.analytics.sha &&
                    window.self === window.top // don't auto-refresh hosted
                ) {
                    console.warn(
                        `web app updated ${version.sha} !== ${window.analytics.sha}`
                    )
                    window.location.reload()
                }
            } catch (e) {
                console.error(e)
            }
        }
    }, UPDATE_DEBOUNCE - 1000)
}

export const onRouteUpdate = async ({ location }, options) => {
    if (window.analytics && window.analytics.page) window.analytics.page()
    try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) reg.update()
        else tryUpdate()
    } catch(e) {
        console.debug(e)
    }
}

export const onServiceWorkerUpdateReady = () => {
    // force reload
    console.debug(`offline: update ready, reloading...`)
    window.location.reload(true)
}

export const wrapPageElement = Layout

window.addEventListener(`unhandledrejection`, event => {
    if (/loading chunk \d* failed/i.test(event.reason)) {
        console.log(`loading chunk failed, trying to update...`)
        tryUpdate(true)
    }
})

// inject React Axe into DOM tree at development time
export const onInitialClientRender = () => {
    const activeEnv =
        process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || "development"
    const isDev = activeEnv === "development"
    if (isDev) {
        console.log(`axe: injecting into DOM`)
        import("@axe-core/react").then(reactAxe => {
            reactAxe.default(React, ReactDOM, 1000, {})
        })
    }
}
