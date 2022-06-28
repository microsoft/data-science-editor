import { Typography } from "@mui/material"
import React, { ReactNode } from "react"
import CodeBlock from "../CodeBlock"

export default function Snippet(props: {
    value: string | (() => string)
    mode?: string
    download?: string
    actions?: ReactNode
    url?: string
    caption?: string | JSX.Element | JSX.Element[]
    copy?: boolean
}) {
    const { value, mode, download, url, caption, actions, copy } = props
    const v: string = typeof value === "function" ? value() : value
    const className = mode && `language-${mode === "sts" ? "ts" : mode}`
    return (
        <>
            <CodeBlock
                className={className}
                downloadName={download}
                downloadText={download && v}
                actions={actions}
                url={url}
                copy={copy}
            >
                {v}
            </CodeBlock>
            {caption && <Typography variant="caption">{caption}</Typography>}
        </>
    )
}
