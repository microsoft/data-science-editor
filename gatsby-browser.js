import Layout from "./src/components/layout"
import React from "react"
import ReactDOM from "react-dom"

export const onRouteUpdate = ({ location }, options) => {
    if (window.analytics && window.analytics.page) window.analytics.page()
    // try update on every internal navigation
    navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) reg.update()
    })
}

export const onServiceWorkerUpdateReady = () => {
    // force reload
    console.debug(`offline: update ready, reloading...`)
    window.location.reload(true)
}

export const wrapPageElement = Layout

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
