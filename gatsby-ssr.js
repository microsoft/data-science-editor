import Layout from "./src/components/layout"

export const wrapPageElement = Layout

export const onRenderBody = ({ setHtmlAttributes }) => {
    setHtmlAttributes({ lang: "en" })
}
