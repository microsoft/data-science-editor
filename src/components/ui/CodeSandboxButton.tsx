import React, { useContext, useState } from "react"
import AppContext from "../AppContext"
import EditIcon from "@material-ui/icons/Edit"
import IconButtonWithTooltip from "./IconButtonWithTooltip"

const HTML_TEMPLATE = `<p>Open Javascript console to see messages...</p>`

export default function CodeSandboxButton(props: {
    title?: string
    source: { js: string; html: string }
}) {
    const { title, source } = props
    const { js = "", html = HTML_TEMPLATE } = source
    const { setError } = useContext(AppContext)
    const [importing, setImporting] = useState(false)

    const handleClick = async () => {
        const indexJs = `
import "milligram";
import { createUSBBus, CHANGE } from "jacdac-ts";
const btn = document.getElementById("connectbtn");
const bus = createUSBBus();
bus.on(CHANGE, () => { btn.innerText = bus.connected ? "connected 🎉" : "connect" })
btn.onclick = async () => bus.connect();

${js}
`
        const indexHtml = `
<html>
    <body>
        <h1>Jacdac ${title || "demo"}</h1>
        <div>
        <button id="connectbtn">connect</button>
        </div>    

${html}

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
