import React, { useCallback } from "react"
import CodeSandboxButton from "./CodeSandboxButton"

export default function P5JSCodeButton(props: { sketch: string }) {
    const { sketch } = props
    const files = useCallback(
        () => ({
            "index.html": {
                content: `<!DOCTYPE html>
<html lang="en">
    <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/addons/p5.sound.min.js"></script>
        <script src="https://unpkg.com/jacdac-ts/dist/p5.jacdac.js"></script>
        <link rel="stylesheet" type="text/css" href="style.css">
        <meta charset="utf-8" />
    </head>
    <body>
    <script src="sketch.js"></script>
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
