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

        const indexJs = `
import "milligram";
import { createWebBus, CONNECTION_STATE } from "jacdac-ts";
${imports}
const connectEl = document.getElementById("connectbtn");
const logEl = document.getElementById("log")
const log = (msg) => {
    console.log(msg)
    logEl.innerText += msg + "\\n"
}
// create WebUSB bus
const bus = createWebBus();
// track connection state and update button
bus.on(CONNECTION_STATE, () => { connectEl.innerText = bus.connected ? "connected 🎉" : "connect" })
// connect must be triggered by a user interaction
connectEl.onclick = async () =>
  bus.connected ? bus.disconnect() : bus.connect();

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
    <script src="./index.js" />
    </body>
</html>    
        `
        return {
            "package.json": {
                content: {
                    dependencies: {
                        "jacdac-ts": "latest",
                        milligram: "latest",
                    },
                },
            },
            "index.js": {
                content: indexJs,
            },
            "index.html": {
                content: indexHtml,
            },
        }
    }, [title, source, js, html])

    return <CodeSandboxButton files={files} />
}
