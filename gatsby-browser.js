import Layout from "./src/components/layout"
import React from "react"
import ReactDOM from "react-dom"

const UPDATE_DEBOUNCE = 5000
let lastUpdate = Date.now()
function tryUpdate(force) {
    const now = Date.now()
    if (now - lastUpdate < UPDATE_DEBOUNCE) return
    lastUpdate = now

    setTimeout(
        () =>
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) reg.update()
                else if (force) window.location.reload()
            }),
        UPDATE_DEBOUNCE - 1000
    )
}

export const onRouteUpdate = ({ location }, options) => {
    if (window.analytics && window.analytics.page) window.analytics.page()
    tryUpdate()
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
/* blocked by crypto import issue
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
*/
