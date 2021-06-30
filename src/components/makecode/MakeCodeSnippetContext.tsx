import React, { createContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage"

const editors = {
    arcade: "https://arcade.makecode.com/beta/",
    microbit: "https://makecode.microbit.org/beta/",
    maker: "https://maker.makecode.com/"
}
export interface MakeCodeSnippetContextProps {
    target: string, setTarget: (t: string) => void,
    editor: string, setEditor: (t: string) => void,
    rendererUrl: string,
    simUrl: string,
}

const MakeCodeSnippetContext = createContext<MakeCodeSnippetContextProps>({
    target: undefined,
    setTarget: (t) => { },
    editor: undefined,
    setEditor: (t) => { },
    rendererUrl: undefined,
    simUrl: undefined,
});
MakeCodeSnippetContext.displayName = "MakeCode";

export default MakeCodeSnippetContext;

export function MakeCodeSnippetProvider(props: { children }) {
    const [target, setTarget] = useLocalStorage("mkcd:editor", "microbit");
    const [editor, setEditor] = useLocalStorage("mdcd:editor", "blocks");
    const { children } = props;

    const useLocalhost = typeof window !== "undefined" && /localhostmakecode=1/.test(window.location.search);
    const rendererUrl =
        useLocalhost ? "http://localhost:3232/--docs"
            : ((editors[target] || editors["microbit"]) + "---docs")
    const simUrl =
        useLocalhost ? "http://localhost:3232/--run"
            : ((editors[target] || editors["microbit"]) + "---run")

    return <MakeCodeSnippetContext.Provider value={{
        target, setTarget, editor, setEditor,
        rendererUrl, simUrl
    }}>
        {children}
    </MakeCodeSnippetContext.Provider>;
}
