import React, { useContext, useState } from "react"
import AppContext from "../AppContext"
import EditIcon from "@material-ui/icons/Edit"
import IconButtonWithTooltip from "./IconButtonWithTooltip"

export default function CodeSandboxButton(props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    files: () => Record<string, any>
}) {
    const { files } = props
    const { setError } = useContext(AppContext)
    const [importing, setImporting] = useState(false)

    const handleClick = async () => {
        const f = files()
        const file =
            Object.keys(f).filter(fn => /\.js$/.test(fn))[0] || "index.js"
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
                        files: f,
                    }),
                }
            )
            const data = await x.json()
            console.log(data)
            const url = `https://codesandbox.io/s/${data.sandbox_id}?file=/${file}`
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
