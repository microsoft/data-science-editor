import React, { useCallback } from "react"
import CodeSandboxButton from "./CodeSandboxButton"

export default function P5JSCodeButton(props: { sketch: string }) {
    const { sketch } = props
    const files = useCallback(
        () => ({
            "index.html": {
                content: `
<html>
<head>
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="https://unpkg.com/p5@1.4.0/lib/p5.js"></script>
    <script src="https://unpkg.com/jacdac-ts/dist/p5.jacdac.js"></script>
    <script src="sketch.js"></script>
</head>
<body>
    <main>
    </main>
</body>
</html>                
`,
            },
            "sketch.js": {
                content: `/* eslint-disable no-undef, no-unused-vars */

${sketch}
`,
            },
            "style.css": {
                content: `html, body {
    width:100%;
    height:100%;
    margin: 0;
    padding: 0;
}`,
            },
        }),
        [sketch]
    )

    return <CodeSandboxButton files={files} />
}
