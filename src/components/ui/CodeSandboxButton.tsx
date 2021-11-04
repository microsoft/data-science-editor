import React, { useContext, useState } from "react"
import AppContext from "../AppContext"
import EditIcon from "@mui/icons-material/Edit"
import IconButtonWithTooltip from "./IconButtonWithTooltip"
import useMediaQueries from "../hooks/useMediaQueries"
import { Button } from "gatsby-material-ui-components"

export default function CodeSandboxButton(props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    files: () => Record<string, any>
    startFile?: string
}) {
    const { files, startFile } = props
    const { setError } = useContext(AppContext)
    const { mobile } = useMediaQueries()
    const [importing, setImporting] = useState(false)

    const handleClick = async () => {
        const f = files()
        const file =
            startFile ||
            Object.keys(f).filter(fn => /\.js$/.test(fn))[0] ||
            "index.js"
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
            const url = `https://codesandbox.io/s/${data.sandbox_id}?file=/${file}`
            window.location.href = url
        } catch (error) {
            setError(error)
        } finally {
            setImporting(false)
        }
    }

    return mobile ? (
        <IconButtonWithTooltip
            color="primary"
            onClick={handleClick}
            disabled={importing}
            title="Try in CodeSandbox"
        >
            <EditIcon />
        </IconButtonWithTooltip>
    ) : (
        <Button
            color="primary"
            variant="outlined"
            onClick={handleClick}
            startIcon={<EditIcon />}
            disabled={importing}
        >
            Try in CodeSandbox
        </Button>
    )
}
