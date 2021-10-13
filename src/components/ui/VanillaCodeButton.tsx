import React, { useCallback } from "react"
import CodeSandboxButton from "./CodeSandboxButton"

export default function VanillaCodeButton(props: {
    title?: string
    source: { js?: string; html?: string }
}) {
    const { title, source } = props
    const { js = "", html = "" } = source

    const files = useCallback(() => {
        // find imports
        const i = js.indexOf("\n\n")
        const imports = js.slice(0, i)
        const code = js.slice(i + 2).trim()

        const indexTs = `
import "milligram";
import { createWebBus, CONNECTION_STATE } from "jacdac-ts";
${imports}

const connectEl = document.getElementById("connectbtn") as HTMLButtonElement;
const logEl = document.getElementById("log") as HTMLPreElement;
const log = (msg: any) => {
  console.log(msg);
  logEl.innerText += msg + "\\n";
};
// create WebUSB bus
const bus = createWebBus();
// track connection state and update button
bus.on(CONNECTION_STATE, () => {
  connectEl.innerText = bus.connected
    ? "connected 🎉"
    : bus.disconnected
    ? "connect"
    : "👀👀👀";
});
// connect must be triggered by a user interaction
connectEl.onclick = async () =>
  bus.connected ? bus.disconnect() : bus.connect();
// we're ready
log("click connect to start")

${code}
`
        const indexHtml = `
<html>
    <body>
        <h1>Jacdac ${title || "demo"}</h1>
        <div>
        <button id="connectbtn">connect</button>
        </div>    

${html}
        <pre id="log"></pre>

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
    <script src="./index.ts"></script>
    </body>
</html>    
        `

        return {
            "package.json": {
                content: {
                    name: "vanilla-jacdac-typescript",
                    version: "0.0.0",
                    description:
                        "Vanilla Jacdac + TypeScript sandbox - https://aka.ms/jacdac",
                    main: "index.html",
                    scripts: {
                        start: "parcel index.html --open",
                        build: "parcel build index.html",
                    },
                    dependencies: {
                        "jacdac-ts": "^1.18.13",
                        milligram: "^1.4.1",
                        "parcel-bundler": "^1.12.5",
                    },
                    devDependencies: {
                        typescript: "^4.4.3",
                    },
                    resolutions: {
                        "@babel/preset-env": "^7.15.8",
                    },
                    keywords: ["jacdac", "typescript", "javascript"],
                    browserslist: ["defaults"],
                },
            },
            "index.ts": {
                content: indexTs,
            },
            "index.html": {
                content: indexHtml,
            },
        }
    }, [title, source, js, html])

    return <CodeSandboxButton files={files} />
}
