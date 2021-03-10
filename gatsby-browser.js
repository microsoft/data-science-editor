import Layout from "./src/components/layout"
import React from 'react'
import ReactDOM from 'react-dom'

export const onRouteUpdate = ({ location }, options) => {
  if (window.analytics)
    window.analytics.page();
}

export const wrapPageElement = Layout

const activeEnv = process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || 'development'
const isDev = activeEnv === 'development'

/*
export const onInitialClientRender = () => {
  if (isDev) {
    import("@axe-core/react").then(reactAxe => {
      reactAxe.default(React, ReactDOM, 1000, {})
    });
  }
}
*/