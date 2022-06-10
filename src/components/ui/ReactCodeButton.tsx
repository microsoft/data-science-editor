import React, { useCallback } from "react"
import CodeSandboxButton from "./CodeSandboxButton"
import packageJson from "../../../jacdac-ts/package.json"
import reactPackageJson from "../../../react-jacdac/package.json"

const AppTsx = `import React from "react";
import { JacdacProvider } from "react-jacdac";
import { bus } from "./bus";
import Connect from "./Connect";
import Demo from "./Demo";

export default function App() {
  return (
    // wrap your application with the jacdac provider
    <JacdacProvider initialBus={bus}>
      <Connect />
      <Demo />
    </JacdacProvider>
  );
}
`
const ConnectTsx = `import React from "react";
import { useBus, useChange } from "react-jacdac";

/**
 * A barebone connect button for Jacdac. Rewrite to your taste.
 */
export default function Connect() {
  // fetch the bus from the jacdac context
  const bus = useBus();
  // fetch the connect state, useChange will trigger a re-render when connected changes
  const connected = useChange(bus, (_) => _.connected);
  // connect or disconnect in a handler
  const handleConnect = () => (connected ? bus.disconnect() : bus.connect());

  return (
    <div>
        <button onClick={handleConnect}>
        jacdac {connected ? "disconnect" : "connect"}
        </button>
    </div>
  );
}
`
const indexTsx = `import { createRoot } from "react-dom/client";
import "milligram";

import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
`
const busTs = `import { createWebBus } from "jacdac-ts";

/**
 * The Jacdac bus singleton.
 *
 * Declare this instance in a separate file from your components, to avoid
 * reloading the bus in the development hot-reload cycles.
 */
export const bus = createWebBus();
`

export default function ReactCodeButton(props: {
    title?: string
    source: { tsx?: string }
}) {
    const { title, source } = props
    const { tsx = "" } = source

    const files = useCallback(() => {
        const DemoTsx = tsx
        const indexHtml = `
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <meta name="theme-color" content="#000000">
        </head>
        <body>
            <noscript>
                You need to enable JavaScript to run this app.
            </noscript>
            <div id="root"></div>
            <footer>
            <small>
            Need to learn more about Jacdac?
            <a target="_blank" href="https://aka.ms/jacdac">Read the docs</a>
            or
            <a
                target="_blank"
                href="https://github.com/microsoft/jacdac/discussions"
                >start a discussion</a
            >.
            </small>
        </footer>
    
        </body>        
        </html>  
        `

        return {
            "package.json": {
                content: {
                    name: "react-jacdac-starter",
                    version: "1.0.0",
                    description: "React, Jacdac and TypeScript start",
                    keywords: ["typescript", "react", "starter", "jacdac"],
                    main: "src/index.tsx",
                    dependencies: {
                        milligram: "1.4.1",
                        react: "18.1.0",
                        "react-dom": "18.1.0",
                        "react-scripts": "5.0.1",
                        "jacdac-ts": `^${packageJson.version}`,
                        "react-jacdac": `^${reactPackageJson.version}`,
                    },
                    devDependencies: {
                        "@types/react": "^18.0.12",
                        "@types/react-dom": "^18.0.5",
                        typescript: "^4.7.3",
                    },
                    scripts: {
                        start: "react-scripts start",
                        build: "react-scripts build",
                        test: "react-scripts test --env=jsdom",
                        eject: "react-scripts eject",
                    },
                    browserslist: [
                        ">0.2%",
                        "not dead",
                        "not ie <= 11",
                        "not op_mini all",
                    ],
                },
            },
            "src/bus.ts": { content: busTs },
            "src/App.tsx": { content: AppTsx },
            "src/Connect.tsx": { content: ConnectTsx },
            "src/Demo.tsx": { content: DemoTsx },
            "src/index.tsx": {
                content: indexTsx,
            },
            "public/index.html": {
                content: indexHtml,
            },
        }
    }, [title, source, tsx])

    return <CodeSandboxButton files={files} startFile="src/Demo.tsx" />
}
