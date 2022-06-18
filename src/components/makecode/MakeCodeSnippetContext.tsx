import React, { createContext } from "react"
import useLocalStorage from "../hooks/useLocalStorage"

const editors = {
    arcade: "https://arcade.makecode.com/",
    microbit: "https://makecode.microbit.org/",
    maker: "https://maker.makecode.com/",
}
export interface MakeCodeSnippetContextProps {
    editor: string
    setEditor: (t: string) => void
    rendererUrl: string
    simUrl: string
}

const MakeCodeSnippetContext = createContext<MakeCodeSnippetContextProps>({
    editor: undefined,
    setEditor: () => {},
    rendererUrl: undefined,
    simUrl: undefined,
})
MakeCodeSnippetContext.displayName = "MakeCode"

export default MakeCodeSnippetContext

export function MakeCodeSnippetProvider(props: { children }) {
    const [editor, setEditor] = useLocalStorage("mdcd:editor", "blocks")
    const { children } = props

    const useLocalhost =
        typeof window !== "undefined" &&
        /localhostmakecode=1/.test(window.location.search)
    const rendererUrl = useLocalhost
        ? "http://localhost:3232/--docs"
        : editors["microbit"] + "---docs"
    const simUrl = useLocalhost
        ? "http://localhost:3232/--run"
        : editors["microbit"] + "---run"

    return (
        <MakeCodeSnippetContext.Provider
            value={{
                editor,
                setEditor,
                rendererUrl,
                simUrl,
            }}
        >
            {children}
        </MakeCodeSnippetContext.Provider>
    )
}
