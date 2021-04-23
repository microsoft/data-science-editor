import React, { useContext, useState } from "react"
import AppContext from "../AppContext"
import EditIcon from "@material-ui/icons/Edit"
import IconButtonWithTooltip from "./IconButtonWithTooltip"

export default function CodeSandboxButton(props: { source: string }) {
    const { source } = props
    const { setError } = useContext(AppContext)
    const [importing, setImporting] = useState(false)

    const handleClick = async () => {
        const content = `
${source.split(/\n/g).join("\n    ")}
`
        const html = `
<html>
    <script src="./node_modules/jacdac-ts/dist/jacdac-umd.js" />
    <body>
        <p>
            Open console to see messages...
        </p>
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
                                    },
                                },
                            },
                            "index.js": {
                                content,
                            },
                            "index.html": {
                                content: html,
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
