import React from "react"
import CodeBlock from "../CodeBlock"
import useDeviceScript from "./DeviceScriptContext"

export default function DeviceScriptDiagnostics() {
    const { source, compiled } = useDeviceScript()
    const { logs, errors } = compiled || {}
    return (
        <>
            <h3>Jacscript</h3>
            <CodeBlock
                className="javascript"
                downloadName={"test.devs.json"}
                downloadText={source}
            >
                {source || ""}
            </CodeBlock>
            {!!logs && (
                <>
                    <h4>Logs</h4>
                    <pre>{logs}</pre>
                </>
            )}
            {!!errors?.length && (
                <>
                    <h4>Errors</h4>
                    <ul>
                        {errors?.map(error => (
                            <li
                                key={`${error.line}:${error.column}:${error.message}`}
                            >
                                {error.line}:{error.column}&gt; {error.message}
                                <pre>{error.codeFragment}</pre>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </>
    )
}
