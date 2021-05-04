import { Theme } from "@material-ui/core"
import { MDXProvider } from "@mdx-js/react"
import React, { ReactNode } from "react"
import useMdxComponents from "../useMdxComponents"
import ThemedLayout from "./ThemedLayout"

export default function ThemedMdxLayout(props: {
    theme: Theme
    children: ReactNode
}) {
    const { theme, children } = props
    const mdxComponents = useMdxComponents()

    return (
        <ThemedLayout theme={theme}>
            <MDXProvider components={mdxComponents}>{children}</MDXProvider>
        </ThemedLayout>
    )
}
