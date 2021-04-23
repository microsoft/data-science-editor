import { AlertTitle } from "@material-ui/lab"
import { Button } from "gatsby-theme-material-ui"
import React from "react"
import CodeSandboxer from "react-codesandboxer"
import Alert from "./Alert"
import LoadingProgress from "./LoadingProgress"

const pkgJSON = {
    name: "jacdac-demo",
    version: "0.0.0",
    dependencies: {
        "jacdac-ts": "latest",
    },
}
export default function CodeSandboxButton(props: { source: string }) {
    const { source } = props
    return (
        <CodeSandboxer
            examplePath="index.js"
            example={source}
            pkgJSON={pkgJSON}
            importReplacements={[["src", pkgJSON.name]]}
            template='create-react-app-typescript'
            afterDeploy={console.log}
        >
            {({ isLoading, error }) => (
                <>
                    {isLoading ? (
                        <LoadingProgress />
                    ) : (
                        <Button type="submit" disabled={!!error}>
                            Try in CodeSandbox
                        </Button>
                    )}
                    {error && (
                        <Alert severity="error">
                            <AlertTitle>Error</AlertTitle>
                            <pre>{error + ""}</pre>
                        </Alert>
                    )}
                </>
            )}
        </CodeSandboxer>
    )
}
