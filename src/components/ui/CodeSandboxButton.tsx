import React, { useContext, useState } from "react"
import AppContext from "../AppContext"
import EditIcon from "@material-ui/icons/Edit"
import IconButtonWithTooltip from "./IconButtonWithTooltip"

export default function CodeSandboxButton(props: {
    title?: string
    source: { js: string; html: string }
}) {
    const { title, source } = props
    const { js = "", html = "" } = source
    const { setError } = useContext(AppContext)
    const [importing, setImporting] = useState(false)

    const handleClick = async () => {
        // find imports
        const i = js.indexOf("\n\n")
        const imports = js.slice(0, i)
        const code = js.slice(i + 2).trim()

        const indexJs = `
import "milligram";
import { createUSBBus, CHANGE } from "jacdac-ts";
${imports}
const connectEl = document.getElementById("connectbtn");
const logEl = document.getElementById("log")
const log = (msg) => logEl.innerText += msg + "\\n"
const bus = createUSBBus();
bus.on(CHANGE, () => { connectEl.innerText = bus.connected ? "connected 🎉" : "connect" })
connectEl.onclick = async () => bus.connect();

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
        try {
            setImporting(true)
            const x = await fetch(
                "https://codesandbox.io/api/v1/sandboxes/define?json=1",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        files: {
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
                        },
                    }),
                }
            )
            const data = await x.json()
            console.log(data)
            const url = `https://codesandbox.io/s/${data.sandbox_id}?file=/index.js`
            window.location.href = url
        } catch (error) {
            setError(error)
        } finally {
            setImporting(false)
        }
    }

    return (
        <IconButtonWithTooltip
            onClick={handleClick}
            disabled={importing}
            title="Try in CodeSandbox"
        >
            <EditIcon />
        </IconButtonWithTooltip>
    )
}
